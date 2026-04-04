import Link from 'next/link';
import { Network, DatabaseZap, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Knowledge Graph Builder',
  description: 'Transform unstructured text into interactive concept networks.',
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-100 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 text-center max-w-3xl px-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-sm font-medium mb-8">
          <Sparkles className="w-4 h-4" />
          <span>Powered by Google Gemini 2.5</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-br from-zinc-100 to-zinc-400 text-transparent bg-clip-text">
          Think in Systems.
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 mb-12 font-light leading-relaxed">
          Instantly transform your unstructured notes, research papers, and ideas into highly visual and interactive knowledge graphs.
        </p>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] hover:-translate-y-1"
        >
          <Network className="w-6 h-6" />
          Start Building Nodes
        </Link>
      </div>

      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl px-6 relative z-10">
        <FeatureCard 
          icon={<DatabaseZap className="w-6 h-6 text-emerald-400" />}
          title="Instant Structuring"
          desc="Paste any text up to 10,000 characters and let AI identify core entities and their relationships."
        />
        <FeatureCard 
          icon={<Network className="w-6 h-6 text-emerald-400" />}
          title="Contextual Expansion"
          desc="Click on any node to dynamically expand its context and grow your graph organically."
        />
        <FeatureCard 
          icon={<Sparkles className="w-6 h-6 text-emerald-400" />}
          title="Infinite Canvas"
          desc="Navigate complex information architecture seamlessly with smooth zoom and pan controls."
        />
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl backdrop-blur">
      <div className="w-12 h-12 bg-zinc-800 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-zinc-200">{title}</h3>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
