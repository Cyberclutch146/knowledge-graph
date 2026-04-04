import { create } from 'zustand';
import { AppNode, AppEdge } from '@/lib/types';

interface GraphState {
  title: string | null;
  nodes: AppNode[];
  edges: AppEdge[];
  loading: boolean;
  selectedNode: AppNode | null;
  searchQuery: string;
  error: string | null;
  debugMode: boolean;
  debugLogs: string[];
  
  setGraph: (title: string, nodes: AppNode[], edges: AppEdge[], rawLog?: string) => void;
  clearGraph: () => void;
  setLoading: (loading: boolean) => void;
  setSelectedNode: (node: AppNode | null) => void;
  setSearchQuery: (query: string) => void;
  setError: (error: string | null) => void;
  toggleDebugMode: () => void;
  expandNode: (nodeLabel: string) => Promise<void>;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  title: null,
  nodes: [],
  edges: [],
  loading: false,
  selectedNode: null,
  searchQuery: '',
  error: null,
  debugMode: typeof window !== 'undefined' ? localStorage.getItem('kgb_debug') === 'true' : false,
  debugLogs: [],

  setGraph: (title, nodes, edges, rawLog) => set(state => ({ 
    title, nodes, edges, error: null,
    debugLogs: rawLog ? [rawLog] : state.debugLogs 
  })),
  
  clearGraph: () => set({ title: null, nodes: [], edges: [], error: null, debugLogs: [] }),
  setLoading: (loading) => set({ loading }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setError: (error) => set({ error }),
  
  toggleDebugMode: () => {
    const newVal = !get().debugMode;
    if (typeof window !== 'undefined') localStorage.setItem('kgb_debug', String(newVal));
    set({ debugMode: newVal });
  },

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
      
      const existingLabels = new Set(state.nodes.map(n => n.label.toLowerCase()));
      const newNodes = data.nodes.filter((n: AppNode) => !existingLabels.has(n.label.toLowerCase()));
      
      // Ensure unique edge IDs
      const existingEdgeIds = new Set(state.edges.map(e => e.id));
      const newEdges = data.edges.filter((e: AppEdge) => !existingEdgeIds.has(e.id));

      set({ 
        nodes: [...state.nodes, ...newNodes],
        edges: [...state.edges, ...newEdges],
        loading: false,
        debugLogs: data._debugRaw ? [...state.debugLogs, `[EXPAND]\n${data._debugRaw}`] : state.debugLogs
      });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  }
}));
