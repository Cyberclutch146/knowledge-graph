import { expandNodeFromContext } from '@/lib/ai';
import { parseAIOutput } from '@/lib/validation';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    console.log('[API] /api/expand handler hit');

    if (req.method !== 'POST') {
      return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseErr) {
      return Response.json({ success: false, error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { nodeLabel, existingNodes = [], existingEdges = [] } = body;

    if (!nodeLabel || typeof nodeLabel !== 'string') {
      return Response.json({ success: false, error: 'Node label is required' }, { status: 400 });
    }

    console.log(`[API] Invoking AI expansion pipeline for node: ${nodeLabel}`);
    const rawAiOutput = await expandNodeFromContext(nodeLabel, existingNodes, existingEdges);
    console.log('[API] AI expansion completed');
    
    let parsedGraph;
    try {
      parsedGraph = parseAIOutput(rawAiOutput);
    } catch (valErr) {
      console.warn('[API] AI Validation error resolving to fallback map', valErr);
      parsedGraph = { nodes: [], edges: [] };
    }

    const allowedLabels = new Set([...existingNodes, ...parsedGraph.nodes.map(n => n.label)]);

    const mappedNodes = parsedGraph.nodes.slice(0, 7).map((n, i) => ({ 
      id: `ext_${crypto.randomBytes(8).toString('hex')}`, 
      label: n.label, 
      type: n.type,
      graphId: 'pending'
    }));
    
    const mappedEdgesRaw = parsedGraph.edges.map((e) => {
      const sourceId = mappedNodes.find(n => n.label === e[0])?.id || `ext_${e[0]}`;
      const targetId = mappedNodes.find(n => n.label === e[2])?.id || `ext_${e[2]}`;
      const stringifiedLabel = e[1].replace(/\s+/g, '_').toLowerCase();
      
      return {
        id: `ext_${sourceId}_${stringifiedLabel}_${targetId}`,
        source: sourceId,
        target: targetId,
        label: e[1],
        graphId: 'pending'
      };
    }).filter(e => allowedLabels.has(e.source.replace('ext_', '')) || allowedLabels.has(e.target.replace('ext_', '')));

    const edgeSeen = new Set<string>();
    const mappedEdges = mappedEdgesRaw.filter(e => {
        if(edgeSeen.has(e.id)) return false;
        edgeSeen.add(e.id);
        return true;
    });

    return Response.json({
      success: true,
      data: {
        nodes: mappedNodes,
        edges: mappedEdges,
        _debugRaw: process.env.NODE_ENV === 'development' ? rawAiOutput : undefined
      }
    });

  } catch (err: any) {
    console.error('API /api/expand ERROR:', err);
    return Response.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error processing expand request' 
    }, { status: 500 });
  }
}
