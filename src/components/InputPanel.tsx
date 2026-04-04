'use client';

import { useState } from 'react';
import { useGraphStore } from '@/store/useGraphStore';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function InputPanel() {
  const [text, setText] = useState('');
  const { setGraph, setLoading, loading, setError, error } = useGraphStore();

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('Failed to generate graph');
      const data = await res.json();
      setGraph(data.nodes, data.edges);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 p-6 border-r border-zinc-800 text-zinc-100">
      <h2 className="text-xl font-bold mb-4 tracking-tight">Data Source</h2>
      <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
        Paste your unstructured notes or research material below to generate a structured knowledge graph.
      </p>

      <textarea
        className="flex-1 w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
        placeholder="E.g., Quantum computing relies on qubits, which can exist in multiple states simultaneously due to superposition..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={loading}
      />

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !text.trim()}
        className={clsx(
          "mt-6 flex items-center justify-center py-3 px-4 rounded-lg font-medium transition-all",
          loading || !text.trim()
            ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        )}
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
        {loading ? 'Analyzing...' : 'Generate Graph'}
      </button>
    </div>
  );
}
