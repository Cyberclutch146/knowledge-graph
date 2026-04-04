'use client';

import { useGraphStore } from '@/store/useGraphStore';
import { TerminalSquare, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DebugPanel() {
  const { debugMode, debugLogs, toggleDebugMode } = useGraphStore();
  const [envDev, setEnvDev] = useState(false);

  useEffect(() => {
    // Only render panel logic if explicitly running a dev process
    setEnvDev(process.env.NODE_ENV === 'development');
  }, []);

  if (!envDev || !debugMode) return null;

  return (
    <div className="absolute right-6 top-24 w-96 max-h-[70vh] bg-zinc-900/95 backdrop-blur-xl border border-rose-500/30 rounded-xl shadow-[0_0_40px_rgba(225,29,72,0.1)] z-50 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-rose-500/20 bg-rose-500/10">
        <div className="flex items-center gap-2 text-rose-400">
          <TerminalSquare className="w-4 h-4" />
          <span className="text-xs font-bold font-mono tracking-widest uppercase">Dev Debugger</span>
        </div>
        <button onClick={toggleDebugMode} className="text-zinc-500 hover:text-zinc-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {debugLogs.length === 0 ? (
          <p className="text-zinc-500 text-xs font-mono">No network payloads tracked yet.</p>
        ) : (
          debugLogs.map((log, i) => (
            <div key={i} className="bg-zinc-950 p-3 rounded border border-zinc-800 font-mono text-[10px] text-emerald-400/70 whitespace-pre-wrap break-words">
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
