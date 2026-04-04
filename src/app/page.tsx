import Link from "next/link";
import { ArrowRight, BrainCircuit, Database, Workflow, Code2, Layers } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      
      {/* Background Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-emerald-600 to-emerald-900 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-16 flex flex-col items-center text-center">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8 tracking-wide">
          <BrainCircuit className="w-4 h-4" />
          <span>Production-Ready Graph Architecture</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
          Decode the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Architecture</span>
          <br /> hidden in your text.
        </h1>

        <p className="max-w-2xl text-lg text-zinc-400 mb-12 leading-relaxed font-light">
          Knowledge Graph Builder automatically transforms unstructured system logs, code documentation, and plain text into strictly organized, interactive topological diagrams. Built for engineering teams.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link 
            href="/dashboard"
            className="flex-1 flex items-center justify-center px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_40px_rgba(16,185,129,0.4)]"
          >
            Launch Builder <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link 
            href="/graphs"
            className="flex-1 flex items-center justify-center px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl font-medium transition-all shadow-lg"
          >
            <Database className="w-4 h-4 mr-2" /> Data Vault
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-32 text-left">
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center text-emerald-400 mb-6">
              <Workflow className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Deterministic Parsing</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Strictly enforces semantic edges calculating UUIDs programmatically to avoid database collision effectively.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur">
            <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-center text-blue-400 mb-6">
              <Code2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Dagre Layouts</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Prevents node overlapping visually mapping relational components down hierarchical boundaries.
            </p>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-3xl backdrop-blur">
            <div className="w-12 h-12 bg-violet-500/10 border border-violet-500/30 rounded-xl flex items-center justify-center text-violet-400 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Transaction Safety</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Wrapped Prisma commands bind deeply guaranteeing your extracted architectures refuse partial DB writes inherently.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
