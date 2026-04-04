'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGraphStore } from '@/store/useGraphStore';
import { Loader2, Trash2, Bug, Play, Activity } from 'lucide-react';
import clsx from 'clsx';

export default function InputPanel() {
  const [text, setText] = useState('');
  const [isDev, setIsDev] = useState(false);
  
  const { 
    setGraph, resetGraph, setLoading, loading, 
    setError, error, toggleDebugMode, debugMode,
    mode, setMode, nodes, edges
  } = useGraphStore();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') setIsDev(true);
  }, []);

  const handleGenerate = useCallback(async (forcedText?: string) => {
    const payload = forcedText || text;
    if (!payload.trim()) return;
    
    setLoading(true);
    setError(null);
    resetGraph();

    try {
      const res = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: payload, mode }),
      });

      const raw = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (parseErr) {
        console.error("Invalid JSON response from API:", raw);
        throw new Error("Server returned an invalid response (not JSON).");
      }

      if (!parsed.success) throw new Error(parsed.error || 'Failed to generate graph via AI.');
      
      const { title, nodes, edges, _debugRaw } = parsed.data;
      setGraph(title, nodes, edges, _debugRaw);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [text, mode, resetGraph, setGraph, setLoading, setError]);

  // Ctrl+Enter Shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate]);

  const handleDemo = () => {
    const defaultDemoText = "Kubernetes is an open-source container orchestration system for automating software deployment, scaling, and management. It connects with Docker to define runtime architectures and utilizes etcd to maintain distributed key-value configurations continuously.";
    setText(defaultDemoText);
    handleGenerate(defaultDemoText);
  };

  // Stats Calculations
  const calcStats = () => {
    if (nodes.length === 0) return null;
    const density = (edges.length / (nodes.length * Math.max(1, nodes.length - 1))).toFixed(2);
    
    const edgeCounts = new Map<string, number>();
    edges.forEach(e => {
      edgeCounts.set(e.source, (edgeCounts.get(e.source) || 0) + 1);
      edgeCounts.set(e.target, (edgeCounts.get(e.target) || 0) + 1);
    });
    
    let maxId = '';
    let maxEdges = -1;
    edgeCounts.forEach((val, key) => {
      if (val > maxEdges) { maxEdges = val; maxId = key; }
    });
    const mostConnected = nodes.find(n => n.id === maxId)?.label || 'None';

    return { density, mostConnected };
  };

  const stats = calcStats();

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 backdrop-blur border-r border-zinc-800/80 p-6 text-zinc-100 z-10 shadow-2xl relative overflow-y-auto">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight">Data Source</h2>
        {isDev && (
          <button onClick={toggleDebugMode} title="Toggle Dev Debugger" className={clsx("p-2 rounded-md transition-colors border", debugMode ? "bg-rose-500/20 border-rose-500/50 text-rose-400" : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300")}>
            <Bug className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Modes & Demo */}
      <div className="flex gap-2 mb-4">
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg w-full">
          <button 
            onClick={() => setMode('strict')}
            className={clsx("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", mode === 'strict' ? "bg-zinc-800 text-white shadow" : "text-zinc-500 hover:text-zinc-300")}
          >
            Strict Mode
          </button>
          <button 
            onClick={() => setMode('creative')}
            className={clsx("flex-1 text-xs font-medium py-1.5 rounded-md transition-all", mode === 'creative' ? "bg-emerald-900/40 text-emerald-400 shadow" : "text-zinc-500 hover:text-zinc-300")}
          >
            Creative
          </button>
        </div>
      </div>

      <textarea
        className="flex-1 min-h-[200px] w-full bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all shadow-inner font-light leading-relaxed text-sm"
        placeholder="Paste unstructured notes to extract an architectural graph..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      {error && (
        <div className="mt-4 p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-4 flex flex-col gap-3">
        <button
          onClick={() => handleGenerate()}
          disabled={loading || !text.trim()}
          className={clsx(
            "flex items-center justify-center py-3.5 px-4 rounded-xl font-medium transition-all w-full shadow-lg text-sm",
            loading || !text.trim()
              ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-800"
              : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20"
          )}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
          {loading ? 'Analyzing...' : 'Generate Graph'}
          <span className="ml-2 text-[10px] opacity-50 font-mono tracking-tighter">Ctrl+Enter</span>
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleDemo}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-xs font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800 transition-all"
          >
            Try Demo
          </button>
          <button
            onClick={() => { setText(''); resetGraph(); setError(null); }}
            disabled={loading}
            className="flex-1 flex items-center justify-center py-2 px-4 rounded-xl font-medium transition-all text-zinc-400 border border-transparent hover:border-rose-900/30 hover:bg-rose-500/10 hover:text-rose-400"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </button>
        </div>
      </div>

      {stats && (
        <div className="mt-8 pt-6 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 mb-4 text-emerald-500/80">
            <Activity className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest font-mono">Graph Stats</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-3 rounded-lg flex flex-col gap-1 text-center">
              <span className="text-zinc-500">Nodes</span>
              <span className="text-zinc-200 font-bold text-lg">{nodes.length}</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-3 rounded-lg flex flex-col gap-1 text-center">
              <span className="text-zinc-500">Edges</span>
              <span className="text-zinc-200 font-bold text-lg">{edges.length}</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-3 flex flex-col gap-1 rounded-lg text-center col-span-2">
              <span className="text-zinc-500">Most Connected Entity</span>
              <span className="text-emerald-400 font-semibold">{stats.mostConnected}</span>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800/50 p-2 flex justify-between rounded-lg items-center text-center col-span-2">
              <span className="text-zinc-500">Density Matrix</span>
              <span className="text-zinc-200 font-mono">{stats.density}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
