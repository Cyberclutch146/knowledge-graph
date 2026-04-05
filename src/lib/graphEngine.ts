export type NodeOutput = { label: string; type: string };
export type GraphOutput = { title?: string; nodes: NodeOutput[]; edges: [string, string, string][] };

export function normalizeNodeStr(node: string): string {
  return node.trim().toLowerCase();
}

export function constructGraph(rawOutput: GraphOutput): GraphOutput {
  // 1. Normalize and deduplicate nodes based on label semantic uniqueness
  const nodeMap = new Map<string, NodeOutput>();
  
  rawOutput.nodes.forEach(node => {
    const normalized = normalizeNodeStr(node.label);
    // Ignore generic floating terms that lack specific detail
    if (normalized === 'protocol' || normalized === 'concept' || normalized === 'system' || normalized.length < 2) return;
    
    if (normalized && !nodeMap.has(normalized)) {
      nodeMap.set(normalized, {
        label: node.label.trim(),
        type: node.type.trim().toLowerCase()
      });
    }
  });
  
  // Enforce Max exactly 15 nodes overall via slice
  let finalNodes = Array.from(nodeMap.values()).slice(0, 15);
  const allowedNormalizedNodes = new Set(finalNodes.map(n => normalizeNodeStr(n.label)));
  
  // 2. Process and validate edges strictly
  const edgeSet = new Set<string>(); // Used to prevent deterministic duplication
  const finalEdges: [string, string, string][] = [];
  const referencedNodeKeys = new Set<string>(); // Tracking edges to nodes to prune floaters later
  
  rawOutput.edges.forEach(edge => {
    if (edge.length !== 3) return;
    
    const rawSource = normalizeNodeStr(edge[0]);
    const rawTarget = normalizeNodeStr(edge[2]);
    const label = edge[1].trim().toLowerCase();
    
    // Ignore self-referencing unless specifically designed
    if (rawSource === rawTarget) return;

    if (allowedNormalizedNodes.has(rawSource) && allowedNormalizedNodes.has(rawTarget)) {
      const sourceOrig = finalNodes.find(n => normalizeNodeStr(n.label) === rawSource)!.label;
      const targetOrig = finalNodes.find(n => normalizeNodeStr(n.label) === rawTarget)!.label;
      
      // Deterministic Edge key (source|cleanedLabel|target)
      const edgeKey = `${rawSource}|${label}|${rawTarget}`;
      
      if (!edgeSet.has(edgeKey)) {
        edgeSet.add(edgeKey);
        finalEdges.push([sourceOrig, edge[1].trim(), targetOrig]);
        referencedNodeKeys.add(rawSource);
        referencedNodeKeys.add(rawTarget);
      }
    }
  });

  // 3. validateGraphIntegrity() - Remove floaters (nodes not present in ANY edge constraint)
  if (finalEdges.length > 0) {
    finalNodes = finalNodes.filter(n => referencedNodeKeys.has(normalizeNodeStr(n.label)));
  }

  return { title: rawOutput.title, nodes: finalNodes, edges: finalEdges };
}
