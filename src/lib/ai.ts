import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Basic in-memory cache for prompt results
const cache = new Map<string, string>();

export async function generateGraphFromText(text: string): Promise<string> {
  const prompt = `You are a strict data extractor. Extract a knowledge graph from the given text. 
Return ONLY valid JSON in this exact format, with no markdown formatting or other text:
{
  "nodes": ["Concept A", "Concept B"],
  "edges": [
    ["Concept A", "relationship description", "Concept B"]
  ]
}
Text to process:
${text}`;

  if (cache.has(prompt)) {
    return cache.get(prompt)!;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const output = response.text || '';
  cache.set(prompt, output);
  return output;
}

export async function expandNodeFromContext(nodeLabel: string, existingNodes: string[], existingEdges: string[]): Promise<string> {
  const prompt = `You are a strict data extractor. Expand the knowledge graph by identifying 2-5 NEW concepts related to "${nodeLabel}".
Do not duplicate existing nodes. Ensure relationships connect the new concepts back to "${nodeLabel}" or other existing concepts.
Existing Nodes: ${JSON.stringify(existingNodes)}
Return ONLY valid JSON in this exact format:
{
  "nodes": ["New Concept A", "New Concept B"],
  "edges": [
    ["${nodeLabel}", "relates to", "New Concept A"],
    ["New Concept A", "another relation", "New Concept B"]
  ]
}`;

  if (cache.has(prompt)) {
    return cache.get(prompt)!;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  const output = response.text || '';
  cache.set(prompt, output);
  return output;
}
