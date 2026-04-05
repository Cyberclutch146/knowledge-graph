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
      .filter((n: unknown) => typeof n === 'object' && n !== null && typeof (n as Record<string, unknown>).label === 'string' && typeof (n as Record<string, unknown>).type === 'string')
      .filter((n: unknown) => {
        const lowerLabel = ((n as Record<string, unknown>).label as string).toLowerCase();
        if (seenNodeLabels.has(lowerLabel)) return false;
        seenNodeLabels.add(lowerLabel);
        return true;
      })
      .slice(0, 15); // Enforce max 15 nodes limit
    
    // Collect allowed labels to drop disconnected edges safely
    const allowedLabels = new Set(nodes.map((n: unknown) => ((n as Record<string, unknown>).label as string).toLowerCase()));

    // Dedup edges by exact source-label-target signature
    const seenEdgeSigs = new Set<string>();
    const edges = parsed.edges
      .filter((e: unknown) => Array.isArray(e) && e.length === 3 && e.every((part: unknown) => typeof part === 'string'))
      .filter((e: unknown) => {
        const arr = e as string[];
        return allowedLabels.has(arr[0].toLowerCase()) && allowedLabels.has(arr[2].toLowerCase());
      })
      .filter((e: unknown) => {
        const arr = e as string[];
        const sig = `${arr[0].toLowerCase()}|${arr[1].toLowerCase()}|${arr[2].toLowerCase()}`;
        if (seenEdgeSigs.has(sig)) return false;
        seenEdgeSigs.add(sig);
        return true;
      });
    
    return { 
      title: parsed.title && typeof parsed.title === 'string' ? parsed.title : 'Generated Graph',
      nodes, 
      edges 
    };
  } catch (error: unknown) {
    console.error('[VALIDATION ERROR] Failed to parse AI output:', error instanceof Error ? error.message : error);
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
