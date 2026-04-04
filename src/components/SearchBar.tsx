'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { Search, Focus } from 'lucide-react';
import clsx from 'clsx';

export default function SearchBar() {
  const { searchQuery, setSearchQuery, focusMode, setFocusMode } = useGraphStore();

  return (
    <div className="absolute top-6 left-6 z-10 flex gap-2">
      <div className="relative flex items-center w-80">
        <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search concepts to filter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 shadow-lg transition-all"
        />
      </div>
      
      <button 
        onClick={() => setFocusMode(!focusMode)}
        title="Toggle Focus Mode (Filter Isolated Edges)"
        className={clsx(
          "flex items-center justify-center p-2 rounded-full border shadow-lg transition-all",
          focusMode 
            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
            : "bg-zinc-900/90 border-zinc-800 text-zinc-500 hover:text-zinc-300 backdrop-blur"
        )}
      >
        <Focus className={clsx("w-5 h-5", focusMode && "animate-pulse")} />
      </button>
    </div>
  );
}
