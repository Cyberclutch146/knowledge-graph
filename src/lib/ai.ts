import { GoogleGenAI } from '@google/genai';
import { promptCache } from './cache';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function fetchWithTimeoutAndRetry(prompt: string, isRetry = false): Promise<string> {
  const timeoutMs = 12000;
  try {
    const genPromise = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    }).then(res => res.text || '');

    const timeoutPromise = new Promise<string>((_, reject) => 
      setTimeout(() => reject(new Error('AI Request Timeout')), timeoutMs)
    );

    const result = await Promise.race([genPromise, timeoutPromise]);
    
    // Rough JSON parse check strictly for retry mechanics
    let cleaned = result.trim();
    if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
    else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
    JSON.parse(cleaned);
    
    return result;
  } catch (err: unknown) {
    if (!isRetry) {
      console.warn(`AI generation failed. Retrying once tightly...`);
      return fetchWithTimeoutAndRetry(prompt + "\n\nCRITICAL ERROR LAST ATTEMPT: You MUST return ONLY valid JSON. No conversational text, no markdown. Start strictly with { and end with }.", true);
    }
    throw err;
  }
}

export async function generateGraphFromText(text: string, mode: 'strict' | 'creative' = 'strict'): Promise<string> {
  const isStrict = mode === 'strict';
  
  const prompt = `[Prompt v2 - Mode: ${isStrict ? 'Strict' : 'Creative'}]
You are an expert systems architect extracting a knowledge graph from text.

Rules:
1. Max 12-15 nodes. Do not exceed this.
2. No duplicate concepts.
3. Node "type" must be strictly one of: 'protocol', 'concept', 'system', 'component'.
4. Avoid vague relationships like "is" or "related to". Use strong verbs like "defines", "uses", "connects", "operates over".
5. Combine redundant edges holding the same semantic meaning.
6. Ensure ALL nodes are connected. No floating nodes.
${isStrict 
? "7. ONLY extract explicit, factual entities clearly stated. Do not hypothesize." 
: "7. Extract explicit entities, but also infer deeper contextual architectures or abstract lateral concepts safely."}

Return ONLY valid JSON in this exact format:
{
  "nodes": [
    { "label": "Concept A", "type": "concept" },
    { "label": "System X", "type": "system" }
  ],
  "edges": [
    ["Concept A", "relationship description", "System X"]
  ]
}
Text to process:
${text}`;

  const cached = promptCache.get(prompt);
  if (cached) return cached;

  const output = await fetchWithTimeoutAndRetry(prompt);
  promptCache.set(prompt, output);
  return output;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function expandNodeFromContext(nodeLabel: string, existingNodes: string[], _existingEdges: string[]): Promise<string> {
  const prompt = `[Prompt v2 - Expansion]
You are a strict data extractor. Expand the knowledge graph by identifying exactly 5-7 NEW tightly related concepts surrounding "${nodeLabel}".
Rules:
1. DO NOT duplicate any nodes currently in the Existing Nodes array.
2. Ensure relationships dynamically connect the new concepts back to "${nodeLabel}" or other existing concepts.
3. Node "type" must be one of: 'protocol', 'concept', 'system', 'component'.

Existing Nodes: ${JSON.stringify(existingNodes)}

Return ONLY valid JSON in this exact format:
{
  "nodes": [
    { "label": "New Concept A", "type": "concept" }
  ],
  "edges": [
    ["${nodeLabel}", "interacts with", "New Concept A"]
  ]
}`;

  const cached = promptCache.get(prompt);
  if (cached) return cached;

  const output = await fetchWithTimeoutAndRetry(prompt);
  promptCache.set(prompt, output);
  return output;
}
