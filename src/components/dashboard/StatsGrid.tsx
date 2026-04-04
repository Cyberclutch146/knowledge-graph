'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { ArrowUpRight, TrendingUp, Activity } from 'lucide-react';

export default function StatsGrid() {
  const { nodes, edges } = useGraphStore();

  const calcStats = () => {
    if (nodes.length === 0) return null;
    const density = (edges.length / (nodes.length * Math.max(1, nodes.length - 1))).toFixed(2);
    
    // Most connected
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

    return { density, mostConnected, totalNodes: nodes.length, totalEdges: edges.length };
  };

  const stats = calcStats();

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Top Stats Box (mimicking "Total sale" box in reference) */}
      <div className="glass-panel p-6 rounded-3xl flex-1 shadow-[0_10px_40px_rgba(3,4,10,0.8)] relative overflow-hidden group">
        <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:border-zinc-500 group-hover:text-white transition-colors cursor-pointer">
          <ArrowUpRight className="w-4 h-4" />
        </div>
        
        <div className="flex items-center gap-3 mb-2 text-zinc-400 text-sm font-medium">
          <Activity className="w-4 h-4" /> Entity Count
        </div>
        
        <div className="text-4xl font-light text-white mb-6">
          {stats ? stats.totalNodes : 0}
          <span className="text-xl text-zinc-500 ml-1 font-mono">,{stats ? stats.totalEdges : '00'}</span>
        </div>

        {/* Bar chart placeholder visual (CSS based) */}
        <div className="mt-auto h-24 flex items-end justify-between gap-2 px-1">
          {[40, 55, 75, 45, 95, 60, 80].map((h, i) => (
            <div key={i} className="w-full relative flex flex-col items-center justify-end h-full">
              <div 
                className={`w-full rounded-t-md transition-all duration-700 ${i === 4 ? 'bg-gradient-to-t from-blue-600/50 to-blue-400/80' : 'bg-[#1a1f3c]'}`} 
                style={{ height: `${h}%` }}
              >
                {i === 4 && <div className="absolute -top-1 inset-x-0 mx-auto w-1 h-1 bg-white rounded-full shadow-[0_0_8px_#fff]" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Trend Box (mimicking "Revenue trend") */}
      <div className="glass-panel p-6 rounded-3xl h-[220px] shadow-[0_10px_40px_rgba(3,4,10,0.8)] relative overflow-hidden group">
        <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 group-hover:border-zinc-500 group-hover:text-white transition-colors cursor-pointer">
          <ArrowUpRight className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-3 mb-1 text-zinc-400 text-sm font-medium">
          <TrendingUp className="w-4 h-4" /> Density Trend
        </div>
        <div className="text-xs text-zinc-600 mb-6 font-mono">Summary Statistics</div>

        <div className="flex justify-between items-center mb-4 text-xs font-mono">
            <div className="flex flex-col"><span className="text-white">Most Connected</span><span className="text-blue-400 truncate max-w-[100px]">{stats?.mostConnected || '-'}</span></div>
            <div className="flex flex-col"><span className="text-white">Density Matrix</span><span className="text-zinc-500">{stats?.density || '0.00'} avg</span></div>
        </div>

        {/* Abstract Area Chart visual */}
        <div className="absolute bottom-0 left-0 right-0 h-24 overflow-hidden pointer-events-none">
           <svg preserveAspectRatio="none" viewBox="0 0 100 100" className="w-full h-full opacity-60">
             <defs>
               <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                 <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                 <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
               </linearGradient>
               <pattern id="stripes" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                 <line x1="0" y1="0" x2="0" y2="4" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.8" />
               </pattern>
             </defs>
             <path d="M0,80 Q25,30 50,60 T100,20 L100,100 L0,100 Z" fill="url(#g)" />
             <path d="M0,80 Q25,30 50,60 T100,20 L100,100 L0,100 Z" fill="url(#stripes)" />
             <path d="M0,80 Q25,30 50,60 T100,20" fill="none" stroke="#60a5fa" strokeWidth="2" />
             <circle cx="50" cy="60" r="3" fill="#fff" className="drop-shadow-[0_0_8px_#fff]" />
           </svg>
        </div>

      </div>
    </div>
  );
}
