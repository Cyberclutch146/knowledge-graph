import { NextResponse } from 'next/server';
import { generateGraphFromText } from '@/lib/ai';
import { parseAIOutput } from '@/lib/validation';
import { constructGraph } from '@/lib/graphEngine';
// import { prisma } from '@/lib/db';

const rateLimitMap = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const recent = timestamps.filter(t => now - t < 60000); 
    
    if (recent.length > 8) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    recent.push(now);
    rateLimitMap.set(ip, recent);

    const body = await req.json();
    const { text } = body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }
    if (text.length > 10000) return NextResponse.json({ error: 'Max length exceeded' }, { status: 400 });

    const rawAiOutput = await generateGraphFromText(text);
    const parsedGraph = parseAIOutput(rawAiOutput);
    const cleanGraph = constructGraph(parsedGraph);

    // Mock ID Mapping creating deterministic IDs guaranteeing uniqueness natively before hitting DB
    const graphId = `g_${Date.now()}`;
    const mappedNodes = cleanGraph.nodes.map((n, i) => ({ 
      id: `n_${i}`, 
      label: n.label, 
      type: n.type, 
      graphId 
    }));
    
    const mappedEdges = cleanGraph.edges.map((e) => {
      const sourceId = mappedNodes.find(n => n.label === e[0])?.id || 'err';
      const targetId = mappedNodes.find(n => n.label === e[2])?.id || 'err';
      const stringifiedLabel = e[1].replace(/\s+/g, '_').toLowerCase();
      // Deterministic key resolving DB collision
      return {
        id: `${sourceId}_${stringifiedLabel}_${targetId}`,
        source: sourceId,
        target: targetId,
        label: e[1],
        graphId
      };
    }).filter(e => e.source !== 'err' && e.target !== 'err');

    /* DB Transaction block
    const savedGraph = await prisma.$transaction(async (tx) => {
      const graph = await tx.graph.create({
        data: { title: cleanGraph.title || "Generated Graph" }
      });
      await tx.node.createMany({
        data: mappedNodes.map(n => ({ ...n, id: undefined, graphId: graph.id })),
        skipDuplicates: true
      });
      // Additional precise cross-mapping required here using queried IDs from inserted nodes
      return graph;
    });
    */

    return NextResponse.json({
      graphId,
      title: cleanGraph.title || "Generated Graph",
      nodes: mappedNodes,
      edges: mappedEdges,
      _debugRaw: process.env.NODE_ENV === 'development' ? rawAiOutput : undefined
    });

  } catch (error) {
    console.error('API Graph error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
