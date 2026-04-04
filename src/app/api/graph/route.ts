import { NextResponse } from 'next/server';
import { generateGraphFromText } from '@/lib/ai';
import { parseAIOutput } from '@/lib/validation';
import { constructGraph } from '@/lib/graphEngine';
// import prisma from '@/lib/db'; // Will be enabled when Prisma works properly

// Basic rate limit tracking (IP -> timestamp array)
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: Request) {
  try {
    // 1. Basic Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const timestamps = rateLimitMap.get(ip) || [];
    const recent = timestamps.filter(t => now - t < 60000); // 1 minute window
    
    if (recent.length > 5) { // Max 5 requests per minute per IP
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    recent.push(now);
    rateLimitMap.set(ip, recent);

    // 2. Input Validation
    const body = await req.json();
    const { text } = body;
    
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }
    
    if (text.length > 10000) {
      return NextResponse.json({ error: 'Text input exceeds maximum allowed length' }, { status: 400 });
    }

    // 3. AI Processing
    const rawAiOutput = await generateGraphFromText(text);

    // 4. Strict Parsing
    const parsedGraph = parseAIOutput(rawAiOutput);

    // 5. Normalization, Deduplication, & Limitations
    const cleanGraph = constructGraph(parsedGraph);

    // 6. DB Persistence
    /* Uncomment later when DB is connected
    const savedGraph = await prisma.graph.create({
      data: {
        title: text.substring(0, 50) + '...',
        nodes: {
          create: cleanGraph.nodes.map(label => ({ label }))
        },
        edges: {
          create: cleanGraph.edges.map(edge => ({
            source: edge[0],
            label: edge[1],
            target: edge[2]
          }))
        }
      },
      include: {
        nodes: true,
        edges: true
      }
    });

    return NextResponse.json({
      graphId: savedGraph.id,
      nodes: savedGraph.nodes,
      edges: savedGraph.edges
    });
    */

    // Returning mock structured data for now so UI works
    return NextResponse.json({
      graphId: 'temp_id',
      nodes: cleanGraph.nodes.map((n, i) => ({ id: `n${i}`, label: n, graphId: 'temp_id' })),
      edges: cleanGraph.edges.map((e, i) => ({
        id: `e${i}`,
        source: `n${cleanGraph.nodes.indexOf(e[0])}`,
        target: `n${cleanGraph.nodes.indexOf(e[2])}`,
        label: e[1],
        graphId: 'temp_id'
      }))
    });

  } catch (error) {
    console.error('API Graph error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
