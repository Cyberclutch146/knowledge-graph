import { GraphOutput } from './types';

export function parseAIOutput(rawOutput: string): GraphOutput {
  try {
    let cleaned = rawOutput.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    }
    
    const parsed = JSON.parse(cleaned);
    
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error('Invalid graph structure: nodes and edges must be arrays');
    }
    
    // Validate object formats { label, type }
    const nodes = parsed.nodes.filter((n: any) => 
      typeof n === 'object' && n !== null && typeof n.label === 'string' && typeof n.type === 'string'
    );
    
    const edges = parsed.edges.filter((e: any) => 
      Array.isArray(e) && e.length === 3 && e.every((part: any) => typeof part === 'string')
    );
    
    // Collect valid graph output
    return { 
      title: parsed.title && typeof parsed.title === 'string' ? parsed.title : 'Generated Graph',
      nodes, 
      edges 
    };
  } catch (error: any) {
    console.error('[VALIDATION ERROR] Failed to parse AI output:', error.message);
    // Safe deterministic fallback graph
    return {
      title: "Fallback Graph",
      nodes: [
        { label: "Concept A", type: "concept" },
        { label: "Concept B", type: "concept" }
      ],
      edges: [
        ["Concept A", "relates to", "Concept B"]
      ]
    };
  }
}
