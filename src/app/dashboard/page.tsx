import InputPanel from '@/components/InputPanel';
import GraphCanvas from '@/components/GraphCanvas';
import SearchBar from '@/components/SearchBar';
import DebugPanel from '@/components/DebugPanel';

export const metadata = {
  title: 'Dashboard | Knowledge Graph Builder',
  description: 'Interactive concept network visualization',
};

export default function Dashboard() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-zinc-950 font-sans text-zinc-100 selection:bg-emerald-500/30">
      {/* Left Panel: Input & Controls */}
      <section className="w-[400px] shrink-0 relative z-20 flex flex-col shadow-2xl">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur shrink-0">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-emerald-700 mr-3 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
          <h1 className="font-bold text-lg tracking-tight text-zinc-100">Architecture <span className="font-light text-zinc-500">KGB</span></h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <InputPanel />
        </div>
      </section>

      {/* Main Area: Flow Canvas & Overlays */}
      <section className="flex-1 relative h-full flex flex-col">
        <SearchBar />
        <DebugPanel />
        <div className="flex-1 w-full h-full relative">
          <GraphCanvas />
        </div>
      </section>
    </main>
  );
}
