'use client';

import GraphCanvas from '@/components/GraphCanvas';
import SearchBar from '@/components/SearchBar';
import DebugPanel from '@/components/DebugPanel';
import { Expand } from 'lucide-react';

export default function GraphCard() {
  return (
    <div className="glass-panel rounded-3xl h-full flex flex-col relative overflow-hidden shadow-[0_10px_40px_rgba(3,4,10,0.8)] border border-[#1a1f3c]">
      
      {/* Internal header layer */}
      <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-[#0c1020] to-transparent z-10 pointer-events-none flex justify-end p-4">
        <div className="pointer-events-auto">
           {/* We can place additional controls here if needed, keeping Graph Canvas minimal */}
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
        <SearchBar />
        <button className="w-10 h-10 rounded-full bg-[#0c1020]/80 backdrop-blur border border-[#1a1f3c] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors shadow-lg">
          <Expand className="w-4 h-4" />
        </button>
      </div>

      <DebugPanel />
      
      <div className="flex-1 w-full h-full relative z-0">
        <GraphCanvas />
      </div>

    </div>
  );
}
