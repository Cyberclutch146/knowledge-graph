'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Clock, LayoutTemplate, Activity } from 'lucide-react';
import clsx from 'clsx';
import { useGraphStore } from '@/store/useGraphStore';

interface GraphMeta {
  id: string;
  title: string;
  createdAt: string;
  _count: { nodes: number; edges: number };
}

export default function SavedGraphs() {
  const [graphs, setGraphs] = useState<GraphMeta[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { setGraph, resetGraph, setLoading: setGraphLoading } = useGraphStore();

  useEffect(() => {
    async function fetchGraphs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/graphs?page=${page}`);
        const raw = await res.text();
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          console.error("Invalid JSON response fetching graphs:", raw);
          return;
        }
        
        if (parsed.success) {
          setGraphs(parsed.data.graphs);
          setTotalPages(parsed.data.pagination.pages);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchGraphs();
  }, [page]);

  const loadGraph = async (id: string) => {
    resetGraph(); // Clean UI flicker strictly
    setGraphLoading(true);
    router.push('/dashboard');
    try {
      const res = await fetch(`/api/graphs/${id}`);
      const raw = await res.text();
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        console.error("Invalid JSON response fetching graph by ID:", raw);
        throw new Error("Server returned invalid response");
      }
      
      if (parsed.success) {
        setGraph(parsed.data.title, parsed.data.nodes, parsed.data.edges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setGraphLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-8 md:p-16">
      <div className="max-w-6xl mx-auto space-y-12 relative">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-600 to-emerald-900 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <header className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-mono uppercase">Data Vault</h1>
            <p className="text-zinc-500 font-light">Explore previously extracted topological architectures.</p>
          </div>
          <Link href="/dashboard" className="flex items-center text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 rounded-2xl bg-zinc-900/50 animate-pulse border border-zinc-800" />
            ))}
          </div>
        ) : graphs.length === 0 ? (
          <div className="text-center py-20 border border-zinc-800 rounded-3xl bg-zinc-900/20 backdrop-blur">
            <LayoutTemplate className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-zinc-300">No Networks Found</h3>
            <p className="text-zinc-500 mt-2">Generate graphs in your dashboard to view them here.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {graphs.map(graph => (
                <div 
                  key={graph.id} 
                  onClick={() => loadGraph(graph.id)}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl bg-zinc-900/60 backdrop-blur border border-zinc-800 p-6 transition-all duration-300 hover:border-emerald-500/50 hover:bg-zinc-800/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:-translate-y-1"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/0 group-hover:bg-emerald-500/80 transition-colors" />
                  
                  <h2 className="text-xl font-semibold mb-6 flex-1 pr-4 line-clamp-2 text-zinc-200 group-hover:text-emerald-400 transition-colors leading-snug">
                    {graph.title}
                  </h2>
                  
                  <div className="flex gap-4 text-xs font-mono text-zinc-500 border-t border-zinc-800 pt-4 group-hover:border-zinc-700 transition-colors">
                    <span className="flex items-center"><Activity className="w-3.5 h-3.5 mr-1 text-emerald-500/60" /> {graph._count.nodes} Nodes</span>
                    <span className="flex items-center"><LayoutTemplate className="w-3.5 h-3.5 mr-1 text-blue-500/60" /> {graph._count.edges} Edges</span>
                  </div>
                  
                  <div className="absolute top-6 right-6 text-xs font-mono text-zinc-600 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(graph.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-10">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className={clsx("px-4 py-2 rounded-lg text-sm font-medium border transition-colors", page === 1 ? "bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed" : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white")}
                >
                  Previous
                </button>
                <span className="text-zinc-500 font-mono text-sm">
                  Page <strong className="text-zinc-300">{page}</strong> of {totalPages}
                </span>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className={clsx("px-4 py-2 rounded-lg text-sm font-medium border transition-colors", page === totalPages ? "bg-zinc-900/50 text-zinc-600 border-zinc-800 cursor-not-allowed" : "bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800 hover:text-white")}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
