'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGraphStore } from '@/store/useGraphStore';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function AiAssistantCard() {
  const [text, setText] = useState('');
  
  const { setGraph, resetGraph, setLoading, loading, setError, error, mode, setMode } = useGraphStore();

  const handleGenerate = useCallback(async () => {
    if (!text.trim() || loading) return;
    
    setLoading(true);
    setError(null);
    resetGraph();

    try {
      const res = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mode }),
      });

      const raw = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("Server returned invalid response.");
      }

      if (!parsed.success) throw new Error(parsed.error || 'AI extraction failed.');
      
      const { title, nodes, edges, _debugRaw } = parsed.data;
      setGraph(title, nodes, edges, _debugRaw);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [text, mode, resetGraph, setGraph, setLoading, setError, loading]);

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

  return (
    <div className="glass-panel rounded-3xl p-6 flex flex-col h-full relative overflow-hidden group shadow-[0_10px_40px_rgba(3,4,10,0.8)]">
      
      {/* Decorative gradient orb */}
      <div className="absolute top-1/4 aspect-square w-[300px] left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-cyan-500/20 blur-[60px] opacity-70 pointer-events-none group-hover:opacity-100 transition-opacity duration-1000" />

      <div className="flex items-center justify-between mb-8 z-10">
        <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
          AI Assistant
        </h2>
        <div className="flex bg-[#070914] border border-[#1a1f3c] rounded-full p-1 shadow-inner">
          <button 
            onClick={() => setMode('strict')}
            className={clsx("text-xs px-3 py-1.5 rounded-full transition-colors", mode === 'strict' ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300")}
          >
            Strict
          </button>
          <button 
            onClick={() => setMode('creative')}
            className={clsx("text-xs px-3 py-1.5 rounded-full transition-colors", mode === 'creative' ? "bg-violet-900/30 text-violet-400" : "text-zinc-500 hover:text-zinc-300")}
          >
            Creative
          </button>
        </div>
      </div>

      <div className="h-48 relative mb-8 w-full flex items-center justify-center shrink-0 z-10">
         {/* Conceptual 3D orb wrapper */}
         <div className="w-40 h-40 rounded-full border-[1.5px] border-cyan-500/30 flex items-center justify-center relative relative">
            <div className="w-32 h-32 rounded-full border border-violet-500/40 border-dashed animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent flex items-center justify-center">
               <Brain className="w-12 h-12 text-blue-400/80 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
            </div>
         </div>
         {/* Extract button layered beautifully */}
         <button 
            onClick={handleGenerate}
            disabled={loading || !text.trim()}
            className="absolute -bottom-2 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 disabled:from-zinc-800 disabled:to-zinc-800 text-white px-6 py-2 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)] text-sm font-medium transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Try Now'}
          </button>
      </div>

      <div className="z-10 flex-1 flex flex-col min-h-0">
        <p className="text-[15px] text-zinc-400 leading-relaxed font-light mb-4">
          <span className="text-white font-medium">Analyze architectures instantly.</span> Supply unstructured text, logs, or concepts and allow the system to map the relational topology.
        </p>

        <textarea
          className="flex-1 min-h-[100px] w-full bg-[#070914]/80 border border-[#1a1f3c] rounded-2xl p-4 text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none transition-all text-sm font-light leading-relaxed custom-scroll"
          placeholder="Paste unstructured notes to extract architectural graph..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />
        
        {error && (
          <div className="mt-4 p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-400 text-xs font-medium">
            {error}
          </div>
        )}
      </div>

    </div>
  );
}
