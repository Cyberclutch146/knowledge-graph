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
    
    // Type validation
    if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
      throw new Error('Invalid graph structure: nodes and edges must be arrays');
    }
    
    const nodes = parsed.nodes.filter((n: any) => typeof n === 'string');
    const edges = parsed.edges.filter((e: any) => 
      Array.isArray(e) && e.length === 3 && e.every((part: any) => typeof part === 'string')
    );
    
    return { nodes, edges };
  } catch (error) {
    console.error('Failed to parse AI output:', error);
    // Return safe fallback
    return {
      nodes: ['Concept A', 'Concept B'],
      edges: [['Concept A', 'relates to', 'Concept B']]
    };
  }
}
