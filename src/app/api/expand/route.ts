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

    // Filter deterministic outputs exactly applying the 5-7 cap if constructGraph missed boundary constraints inside expansions
    const limitedNodes = cleanGraph.nodes.slice(0, 7);
    const allowedLabels = new Set(limitedNodes.map(n => n.label));

    const mappedNodes = limitedNodes.map((n, i) => ({ 
      id: `exp_n_${Date.now()}_${i}`, 
      label: n.label, 
      type: n.type, 
      graphId: 'temp_expand_id' 
    }));
    
    const mappedEdges = cleanGraph.edges.map((e, i) => {
      // Find source/target within expansion OR assume it binds uniquely to existing context via name matching implicitly
      const sourceId = mappedNodes.find(n => n.label === e[0])?.id || `ext_${e[0]}`;
      const targetId = mappedNodes.find(n => n.label === e[2])?.id || `ext_${e[2]}`;
      const labelStr = e[1].replace(/\s+/g, '_').toLowerCase();

      return {
        id: `${sourceId}_${labelStr}_${targetId}`,
        source: sourceId,
        target: targetId,
        label: e[1],
        graphId: 'temp_expand_id'
      };
    }).filter(e => allowedLabels.has(e.source.replace('ext_', '')) || allowedLabels.has(e.target.replace('ext_', '')));

    return NextResponse.json({
      nodes: mappedNodes,
      edges: mappedEdges,
      _debugRaw: process.env.NODE_ENV === 'development' ? rawAiOutput : undefined
    });

  } catch (error) {
    console.error('API Expand error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
