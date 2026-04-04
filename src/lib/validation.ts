import { GraphOutput } from './types';

export function parseAIOutput(rawOutput: string): GraphOutput {
  try {
    let cleaned = rawOutput.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    // Safety against trailing commas typically found in AI generations
    cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');
    
    const parsed = JSON.parse(cleaned);
    
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error('Invalid graph structure: nodes and edges must be arrays');
    }
    
    // Dedup nodes by label
    const seenNodeLabels = new Set<string>();
    const nodes = parsed.nodes
      .filter((n: any) => typeof n === 'object' && n !== null && typeof n.label === 'string' && typeof n.type === 'string')
      .filter((n: any) => {
        const lowerLabel = n.label.toLowerCase();
        if (seenNodeLabels.has(lowerLabel)) return false;
        seenNodeLabels.add(lowerLabel);
        return true;
      })
      .slice(0, 15); // Enforce max 15 nodes limit
    
    // Collect allowed labels to drop disconnected edges safely
    const allowedLabels = new Set(nodes.map((n: any) => n.label.toLowerCase()));

    // Dedup edges by exact source-label-target signature
    const seenEdgeSigs = new Set<string>();
    const edges = parsed.edges
      .filter((e: any) => Array.isArray(e) && e.length === 3 && e.every((part: any) => typeof part === 'string'))
      .filter((e: any) => allowedLabels.has(e[0].toLowerCase()) && allowedLabels.has(e[2].toLowerCase()))
      .filter((e: any) => {
        const sig = `${e[0].toLowerCase()}|${e[1].toLowerCase()}|${e[2].toLowerCase()}`;
        if (seenEdgeSigs.has(sig)) return false;
        seenEdgeSigs.add(sig);
        return true;
      });
    
    return { 
      title: parsed.title && typeof parsed.title === 'string' ? parsed.title : 'Generated Graph',
      nodes, 
      edges 
    };
  } catch (error: any) {
    console.error('[VALIDATION ERROR] Failed to parse AI output:', error.message);
    return {
      title: "Fallback Graph",
      nodes: [
        { label: "Data Quality Issue", type: "system" },
        { label: "Extraction Failed", type: "concept" }
      ],
      edges: [
        ["Data Quality Issue", "caused by", "Extraction Failed"]
      ]
    };
  }
}
