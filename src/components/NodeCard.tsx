'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Network } from 'lucide-react';
import clsx from 'clsx';
import { useGraphStore } from '@/store/useGraphStore';

const TYPE_COLORS: Record<string, string> = {
  concept: "border-emerald-500/50 shadow-emerald-500/10 hover:border-emerald-400 hover:shadow-emerald-500/30 text-emerald-100 bg-emerald-950/40",
  system: "border-blue-500/50 shadow-blue-500/10 hover:border-blue-400 hover:shadow-blue-500/30 text-blue-100 bg-blue-950/40",
  protocol: "border-violet-500/50 shadow-violet-500/10 hover:border-violet-400 hover:shadow-violet-500/30 text-violet-100 bg-violet-950/40",
  component: "border-amber-500/50 shadow-amber-500/10 hover:border-amber-400 hover:shadow-amber-500/30 text-amber-100 bg-amber-950/40",
  default: "border-zinc-500/50 shadow-zinc-500/10 hover:border-zinc-400 hover:shadow-zinc-500/30 text-zinc-100 bg-zinc-900/40"
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  concept: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20",
  system: "bg-blue-500/20 text-blue-400 border-blue-500/20",
  protocol: "bg-violet-500/20 text-violet-400 border-violet-500/20",
  component: "bg-amber-500/20 text-amber-400 border-amber-500/20",
  default: "bg-zinc-500/20 text-zinc-400 border-zinc-500/20"
};

const NodeCard = ({ data, id }: NodeProps) => {
  const { expandNode, loading, searchQuery } = useGraphStore();
  const label = data.label as string;
  const rawType = (data.type as string)?.toLowerCase() || 'default';
  const typeKey = TYPE_COLORS[rawType] ? rawType : 'default';
  
  const colorClasses = TYPE_COLORS[typeKey];
  const badgeClasses = TYPE_BADGE_COLORS[typeKey];
  
  const isMatch = searchQuery && label.toLowerCase().includes(searchQuery.toLowerCase());
  const isDimmed = searchQuery && !isMatch;

  return (
    <div 
      className={clsx(
        "group relative px-5 py-4 rounded-2xl min-w-[160px] shadow-lg border backdrop-blur-md transition-all duration-300",
        colorClasses,
        isMatch && "ring-2 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] scale-105",
        isDimmed && "opacity-20 grayscale scale-95 pointer-events-none"
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-zinc-400 !border-none !rounded-full" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-zinc-400 !border-none !rounded-full" />
      
      <div className="flex flex-col items-center justify-center text-center gap-2">
        <span className={clsx("text-[9px] uppercase tracking-widest font-mono px-2 py-0.5 rounded-full border", badgeClasses)}>
          {rawType}
        </span>
        <span className="text-sm font-semibold tracking-tight">{label}</span>
      </div>

      {!isDimmed && (
        <div className="absolute -bottom-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!loading) expandNode(label);
            }}
            disabled={loading}
            className="p-2 bg-zinc-900 border border-zinc-700 hover:bg-emerald-600 hover:border-emerald-500 rounded-full text-zinc-400 hover:text-white shadow-xl transition-all disabled:opacity-50 hover:scale-110"
            title="Expand Context"
          >
            <Network className="w-4 h-4" />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-zinc-400 !border-none !rounded-full" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-zinc-400 !border-none !rounded-full" />
    </div>
  );
};

export default memo(NodeCard);
