'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useGraphStore();

  return (
    <div className="absolute top-6 left-6 z-10 w-80">
      <div className="relative flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search concepts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900/90 backdrop-blur border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg transition-all"
        />
      </div>
    </div>
  );
}
