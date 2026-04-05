import { generateGraphFromText } from '@/lib/ai';
import { parseAIOutput } from '@/lib/validation';
import { constructGraph } from '@/lib/graphEngine';
import { prisma } from '@/lib/db';
import crypto from 'crypto';

const rateLimitMap = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    console.log('[API] /api/graph handler hit');
    
    if (req.method !== 'POST') {
      return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
    }

    // 1. Basic In-Memory Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const recent = timestamps.filter(t => now - t < 60000); 
    
    if (recent.length > 8) {
      return Response.json({ success: false, error: 'Too many requests' }, { status: 429 });
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);

    let body;
    try {
      body = await req.json();
    } catch {
      return Response.json({ success: false, error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { text, mode = 'strict' } = body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return Response.json({ success: false, error: 'Text input is required' }, { status: 400 });
    }
    if (text.length > 10000) {
      return Response.json({ success: false, error: 'Max length exceeded' }, { status: 400 });
    }

    // 2. Generation & Execution
    console.log('[API] Invoking AI generation pipeline');
    const rawAiOutput = await generateGraphFromText(text, mode);
    console.log('[API] AI generation completed');
    
    const parsedGraph = parseAIOutput(rawAiOutput);
    const cleanGraph = constructGraph(parsedGraph);

    // 3. Fallback Graph / Empty Protection if logic stripped everything
    if (cleanGraph.nodes.length === 0) {
      cleanGraph.nodes = [
        { label: "Extraction Failed", type: "system" },
        { label: "Data Quality Issue", type: "concept" },
        { label: "Input Text", type: "concept" }
      ];
      cleanGraph.edges = [
        ["Extraction Failed", "caused by", "Data Quality Issue"],
        ["Data Quality Issue", "found in", "Input Text"]
      ];
    }

    // 4. Auto-Generate Title from top topological nodes if AI failed to title it well
    let finalTitle = cleanGraph.title;
    if (!finalTitle || finalTitle === 'Generated Graph') {
      const topNodes = [...cleanGraph.nodes].slice(0, 2).map(n => n.label).join(' & ');
      finalTitle = topNodes ? `Architecture: ${topNodes}` : 'Untitled Network';
    }

    // 5. Pre-compute UUIDs and payloads before transaction starts
    const graphId = crypto.randomUUID();

    const nodesData = cleanGraph.nodes.map(n => ({
      id: crypto.createHash('sha256').update(`${graphId}_${n.label}`).digest('hex').substring(0, 24),
      label: n.label,
      type: n.type,
      graphId: graphId
    }));

    const edgesData = cleanGraph.edges.map(e => {
      const sourceLabel = e[0];
      const labelSafe = e[1].toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
      const targetLabel = e[2];

      const sId = nodesData.find(n => n.label === sourceLabel)?.id;
      const tId = nodesData.find(n => n.label === targetLabel)?.id;
      if (!sId || !tId) return null;

      const detId = `${sId}-${labelSafe}-${tId}`.substring(0, 30);
      
      return {
        id: detId,
        source: sId,
        target: tId,
        label: e[1],
        graphId: graphId
      };
    }).filter(Boolean) as Array<{ id: string, source: string, target: string, label: string, graphId: string }>;

    // 6. DB Transaction Execution
    console.log('[API] Opening DB Transaction mappings');
    const txStart = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await prisma.$transaction(async (tx: any) => {
      const graph = await tx.graph.create({
        data: { id: graphId, title: finalTitle }
      });

      await tx.node.createMany({
        data: nodesData,
        skipDuplicates: true
      });

      await tx.edge.createMany({
        data: edgesData,
        skipDuplicates: true
      });

      const dbTime = Date.now() - txStart;
      console.log(`[API] DB Transaction Complete successfully in ${dbTime}ms`);
      if (dbTime > 500) console.warn(`[API] Slow transaction detected: ${dbTime}ms`);

      return {
        graphId: graph.id,
        title: graph.title,
        nodes: nodesData,
        edges: edgesData
      };
    });

    // 7. Return Standardized Struct
    return Response.json({
      success: true,
      data: {
        ...result,
        _debugRaw: process.env.NODE_ENV === 'development' ? rawAiOutput : undefined
      }
    });

  } catch (err: unknown) {
    console.error('API /api/graph ERROR:', err);
    return Response.json({ 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error processing graph request" 
    }, { status: 500 });
  }
}
