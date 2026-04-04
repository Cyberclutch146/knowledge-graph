import dagre from 'dagre';

export function getLayoutedElements(nodes: any[], edges: any[], direction = 'LR') {
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
      targetPosition: direction === 'LR' ? 'left' : 'top',
      sourcePosition: direction === 'LR' ? 'right' : 'bottom',
      position: {
        x: nodeWithPosition.x - 160 / 2, // Centering
        y: nodeWithPosition.y - 60 / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
