import InputPanel from '@/components/InputPanel';
import GraphCanvas from '@/components/GraphCanvas';
import SearchBar from '@/components/SearchBar';

export const metadata = {
  title: 'Dashboard | Knowledge Graph Builder',
  description: 'Interactive concept network visualization',
};

export default function Dashboard() {
  return (
    <main className="flex h-screen w-full overflow-hidden bg-zinc-950">
      {/* Left Panel: Input & Controls */}
      <section className="w-96 shrink-0 relative z-20">
        <InputPanel />
      </section>

      {/* Main Area: Flow Canvas & Overlays */}
      <section className="flex-1 relative h-full">
        <SearchBar />
        <GraphCanvas />
      </section>
    </main>
  );
}
