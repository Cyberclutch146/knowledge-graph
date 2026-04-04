import { create } from 'zustand';
import { AppNode, AppEdge } from '@/lib/types';

interface GraphState {
  title: string | null;
  nodes: AppNode[];
  edges: AppEdge[];
  loading: boolean;
  selectedNode: AppNode | null;
  searchQuery: string;
  focusMode: boolean;
  mode: 'strict' | 'creative';
  error: string | null;
  debugMode: boolean;
  debugLogs: string[];
  
  setGraph: (title: string, nodes: AppNode[], edges: AppEdge[], rawLog?: string) => void;
  resetGraph: () => void;
  setLoading: (loading: boolean) => void;
  setSelectedNode: (node: AppNode | null) => void;
  setSearchQuery: (query: string) => void;
  setFocusMode: (active: boolean) => void;
  setMode: (mode: 'strict' | 'creative') => void;
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
  focusMode: false,
  mode: 'strict',
  error: null,
  debugMode: typeof window !== 'undefined' ? localStorage.getItem('kgb_debug') === 'true' : false,
  debugLogs: [],

  setGraph: (title, nodes, edges, rawLog) => set(state => ({ 
    title, nodes, edges, error: null,
    debugLogs: rawLog ? [rawLog] : state.debugLogs 
  })),
  
  resetGraph: () => set({ 
    title: null, nodes: [], edges: [], 
    selectedNode: null, searchQuery: '', focusMode: false, 
    error: null, debugLogs: [] 
  }),
  
  setLoading: (loading) => set({ loading }),
  setSelectedNode: (selectedNode) => set({ selectedNode }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setFocusMode: (focusMode) => set({ focusMode }),
  setMode: (mode) => set({ mode }),
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

      const raw = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        console.error("Invalid JSON expanding response:", raw);
        throw new Error("Server returned invalid response (not JSON)");
      }

      if (!parsed.success) throw new Error(parsed.error || 'Failed to expand node');

      const data = parsed.data;
      const existingLabels = new Set(state.nodes.map(n => n.label.toLowerCase()));
      const newNodes = data.nodes.filter((n: AppNode) => !existingLabels.has(n.label.toLowerCase()));
      
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
