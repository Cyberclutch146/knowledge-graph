'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Network } from 'lucide-react';
import clsx from 'clsx';
import { useGraphStore } from '@/store/useGraphStore';

const NodeCard = ({ data, id }: NodeProps) => {
  const { expandNode, loading, searchQuery } = useGraphStore();
  const label = data.label as string;
  
  const isMatch = searchQuery && label.toLowerCase().includes(searchQuery.toLowerCase());
  const isDimmed = searchQuery && !isMatch;

  return (
    <div 
      className={clsx(
        "group relative px-4 py-3 rounded-xl min-w-[150px] shadow-lg border transition-all duration-300",
        "bg-zinc-900 border-zinc-700/50 hover:border-emerald-500/50 hover:shadow-emerald-500/10",
        isMatch && "ring-2 ring-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        isDimmed && "opacity-30 grayscale"
      )}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-zinc-600 !border-none" />
      
      <div className="flex flex-col items-center justify-center text-center">
        <span className="text-sm font-medium text-zinc-100">{label}</span>
      </div>

      {!isDimmed && (
        <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!loading) expandNode(label);
            }}
            disabled={loading}
            className="p-1.5 bg-zinc-800 hover:bg-emerald-600 rounded-full text-zinc-400 hover:text-white border border-zinc-700 shadow-md transition-colors disabled:opacity-50"
            title="Expand Node Context"
          >
            <Network className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-zinc-600 !border-none" />
    </div>
  );
};

export default memo(NodeCard);
