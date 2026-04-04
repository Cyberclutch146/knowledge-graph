import { GraphOutput } from './types';

export function normalizeNode(node: string): string {
  return node.trim().toLowerCase();
}

export function constructGraph(rawOutput: GraphOutput): GraphOutput {
  // 1. Normalize and deduplicate nodes
  const nodeMap = new Map<string, string>(); // normalized -> original
  
  rawOutput.nodes.forEach(node => {
    const normalized = normalizeNode(node);
    if (normalized && !nodeMap.has(normalized)) {
      nodeMap.set(normalized, node.trim());
    }
  });
  
  // 2. Limit graph size strictly to 20 nodes
  let finalNodes = Array.from(nodeMap.values()).slice(0, 20);
  const allowedNormalizedNodes = new Set(finalNodes.map(normalizeNode));
  
  // 3. Process and validate edges
  const edgeSet = new Set<string>();
  const finalEdges: [string, string, string][] = [];
  
  rawOutput.edges.forEach(edge => {
    if (edge.length !== 3) return;
    
    // Attempt to map source/target to our normalized nodes
    const rawSource = normalizeNode(edge[0]);
    const rawTarget = normalizeNode(edge[2]);
    const label = edge[1].trim();
    
    if (allowedNormalizedNodes.has(rawSource) && allowedNormalizedNodes.has(rawTarget)) {
      // It's a valid edge
      const sourceOrig = finalNodes.find(n => normalizeNode(n) === rawSource)!;
      const targetOrig = finalNodes.find(n => normalizeNode(n) === rawTarget)!;
      
      const edgeKey = `${rawSource}|${label.toLowerCase()}|${rawTarget}`;
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        finalEdges.push([sourceOrig, label, targetOrig]);
      }
    }
  });

  return { nodes: finalNodes, edges: finalEdges };
}
