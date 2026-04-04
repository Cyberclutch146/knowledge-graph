import { create } from 'zustand';
import { AppNode, AppEdge } from '@/lib/types';

interface GraphState {
  nodes: AppNode[];
  edges: AppEdge[];
  loading: boolean;
  selectedNode: AppNode | null;
  searchQuery: string;
  error: string | null;
  setGraph: (nodes: AppNode[], edges: AppEdge[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedNode: (node: AppNode | null) => void;
  setSearchQuery: (query: string) => void;
  setError: (error: string | null) => void;
  expandNode: (nodeLabel: string) => Promise<void>;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  nodes: [],
  edges: [],
  loading: false,
  selectedNode: null,
  searchQuery: '',
  error: null,

  setGraph: (nodes, edges) => set({ nodes, edges, error: null }),
  setLoading: (loading) => set({ loading }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setError: (error) => set({ error }),

  expandNode: async (nodeLabel) => {
    const state = get();
    set({ loading: true, error: null });

    try {
      const existingNodes = state.nodes.map(n => n.label);
      const existingEdges = state.edges.map(e => `${e.source}->${e.target}`);

      const res = await fetch('/api/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeLabel, existingNodes, existingEdges }),
      });

      if (!res.ok) throw new Error('Failed to expand node');

      const data = await res.json();
      
      // Merge unique nodes by label
      const existingLabels = new Set(state.nodes.map(n => n.label.toLowerCase()));
      const newNodes = data.nodes.filter((n: AppNode) => !existingLabels.has(n.label.toLowerCase()));
      
      // Simple merge for edges (won't be perfect without real id mapping, but works for mock)
      set({ 
        nodes: [...state.nodes, ...newNodes],
        edges: [...state.edges, ...data.edges],
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
}));
