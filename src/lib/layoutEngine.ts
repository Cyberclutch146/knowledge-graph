import dagre from 'dagre';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getLayoutedElements = <T extends { id: string }, E extends { source: string, target: string }>(
  nodes: T[], 
  edges: E[], 
  direction: 'TB' | 'LR' = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Setup basic rank direction and spacing to strictly prevent overlaps
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 80, 
    edgesep: 50, 
    ranksep: 200 
  });

  nodes.forEach((node) => {
    // Estimating node dimensions width/height
    dagreGraph.setNode(node.id, { width: 160, height: 60 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  // Return the mapped nodes mapped perfectly to positioning matrices avoiding overlaps.
  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: (direction === 'LR' ? 'left' : 'top') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      sourcePosition: (direction === 'LR' ? 'right' : 'bottom') as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      position: {
        x: nodeWithPosition.x - 160 / 2, // Centering
        y: nodeWithPosition.y - 60 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
