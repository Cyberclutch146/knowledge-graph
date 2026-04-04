import { Calendar, MessageSquare, Bell } from 'lucide-react';

export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between px-10 w-full shrink-0">
      <h1 className="text-[22px] font-medium tracking-wide text-zinc-100 flex items-center gap-3">
        Knowledge Graph Dashboard
      </h1>

      <div className="flex items-center gap-5">
        <button className="w-10 h-10 rounded-full bg-[#0c1020] border border-[#1a1f3c] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
          <Calendar className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 rounded-full bg-[#0c1020] border border-[#1a1f3c] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors">
          <MessageSquare className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 rounded-full bg-[#0c1020] border border-[#1a1f3c] flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors relative">
          <span className="absolute top-[10px] right-[10px] w-1.5 h-1.5 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
          <Bell className="w-4 h-4" />
        </button>
        
        {/* User Profile */}
        <div className="w-10 h-10 ml-2 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 border-2 border-[#1a1f3c] overflow-hidden flex items-center justify-center">
          {/* using simple placeholder since we don't have user images, keeping simple svg silhouette */}
          <svg className="w-6 h-6 text-zinc-300 mt-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
      </div>
    </header>
  );
}
