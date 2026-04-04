import { NextResponse } from 'next/server';
import { expandNodeFromContext } from '@/lib/ai';
import { parseAIOutput } from '@/lib/validation';
import { constructGraph } from '@/lib/graphEngine';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nodeLabel, existingNodes = [], existingEdges = [] } = body;
    
    if (!nodeLabel || typeof nodeLabel !== 'string') {
      return NextResponse.json({ error: 'Node label is required' }, { status: 400 });
    }

    const rawAiOutput = await expandNodeFromContext(nodeLabel, existingNodes, existingEdges);
    const parsedGraph = parseAIOutput(rawAiOutput);
    const cleanGraph = constructGraph(parsedGraph);

    // Mock response
    return NextResponse.json({
      nodes: cleanGraph.nodes.map((n, i) => ({ id: `new_n_${Date.now()}_${i}`, label: n, graphId: 'temp_id' })),
      edges: cleanGraph.edges.map((e, i) => ({
        id: `new_e_${Date.now()}_${i}`,
        source: `new_n_${Date.now()}_${cleanGraph.nodes.indexOf(e[0])}`, // Note: this mock logic isn't perfect for existing nodes yet
        target: `new_n_${Date.now()}_${cleanGraph.nodes.indexOf(e[2])}`,
        label: e[1],
        graphId: 'temp_id'
      }))
    });

  } catch (error) {
    console.error('API Expand error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
