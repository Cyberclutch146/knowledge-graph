'use client';

import { useState, useEffect } from 'react';
import { useGraphStore } from '@/store/useGraphStore';
import { Loader2, Trash2, Bug } from 'lucide-react';
import clsx from 'clsx';

export default function InputPanel() {
  const [text, setText] = useState('');
  const [isDev, setIsDev] = useState(false);
  const { setGraph, clearGraph, setLoading, loading, setError, error, toggleDebugMode, debugMode } = useGraphStore();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') setIsDev(true);
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    clearGraph();

    try {
      const res = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Failed to generate graph via AI. Please try again.');
      const data = await res.json();
      setGraph(data.title, data.nodes, data.edges, data._debugRaw);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950/80 backdrop-blur border-r border-zinc-800/80 p-6 text-zinc-100 z-10 shadow-2xl relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight">Data Source</h2>
        {isDev && (
          <button onClick={toggleDebugMode} title="Toggle Dev Debugger" className={clsx("p-2 rounded-md transition-colors border", debugMode ? "bg-rose-500/20 border-rose-500/50 text-rose-400" : "bg-zinc-900 border-zinc-800 text-zinc-500")}>
            <Bug className="w-4 h-4" />
          </button>
        )}
      </div>
      
      <p className="text-sm text-zinc-400 mb-4 leading-relaxed font-light">
        Paste your unstructured notes or research. We will extract relationships systematically.
      </p>

      <textarea
        className="flex-1 w-full bg-zinc-900/50 border border-zinc-800/80 rounded-xl p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 resize-none transition-all shadow-inner font-light leading-relaxed"
        placeholder="E.g., Context maps map systemic architectures directly integrating functional components..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      {error && (
        <div className="mt-4 p-4 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-400 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          className={clsx(
            "flex items-center justify-center py-3.5 px-4 rounded-xl font-medium transition-all w-full shadow-lg",
            loading || !text.trim()
              ? "bg-zinc-800/50 text-zinc-500 cursor-not-allowed border border-zinc-800"
              : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-400/20"
          )}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          {loading ? 'Analyzing Entities...' : 'Generate Graph'}
        </button>

        <button
          onClick={() => { setText(''); clearGraph(); setError(null); }}
          disabled={loading}
          className="flex items-center justify-center py-3 px-4 rounded-xl font-medium transition-all text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Graph
        </button>
      </div>
    </div>
  );
}
