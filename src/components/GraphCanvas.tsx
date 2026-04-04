'use client';

import { useMemo, useEffect, useRef, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  BackgroundVariant,
  Panel,
  useReactFlow,
  ReactFlowProvider
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toPng } from 'html-to-image';
import { Download, Database } from 'lucide-react';
import { useGraphStore } from '@/store/useGraphStore';
import NodeCard from './NodeCard';
import { getLayoutedElements } from '@/lib/layoutEngine';

const nodeTypes = { customNode: NodeCard };

function CanvasCore() {
  const flowRef = useRef<HTMLDivElement>(null);
  const { title, nodes: storeNodes, edges: storeEdges, loading, searchQuery, focusMode } = useGraphStore();

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (storeNodes.length === 0) return { layoutedNodes: [], layoutedEdges: [] };
    
    // Focus tracking map calculating adjacent connections
    let activeNodes = new Set<string>();
    if (searchQuery && focusMode) {
      const matchLower = searchQuery.toLowerCase();
      const matchNodeIds = new Set(storeNodes.filter(n => n.label.toLowerCase().includes(matchLower)).map(n => n.id));
      activeNodes = new Set(matchNodeIds);
      
      // Inject 1st-degree relationships for pure Focus context Isolation
      storeEdges.forEach(e => {
        if (matchNodeIds.has(e.source)) activeNodes.add(e.target);
        if (matchNodeIds.has(e.target)) activeNodes.add(e.source);
      });
    }

    const mappedEdges = storeEdges.map(e => {
      const isFocusedEdge = focusMode && searchQuery ? (activeNodes.has(e.source) && activeNodes.has(e.target)) : true;

      return {
        ...e,
        type: 'smoothstep',
        animated: loading,
        hidden: focusMode && searchQuery ? !isFocusedEdge : false,
        style: { stroke: isFocusedEdge ? '#71717a' : '#27272a', strokeWidth: isFocusedEdge ? 1.5 : 0.5 },
        labelStyle: { fill: '#d4d4d8', fontWeight: 500, fontSize: 11 },
        labelBgStyle: { fill: '#18181b', fillOpacity: 0.85, stroke: '#27272a', strokeWidth: 1 },
        labelBgPadding: [6, 4] as [number, number],
        labelBgBorderRadius: 4,
        markerEnd: { type: MarkerType.ArrowClosed, color: isFocusedEdge ? '#71717a' : '#27272a', width: 20, height: 20 },
      };
    });

    const mappedNodes = storeNodes.map(n => ({
      id: n.id,
      type: 'customNode',
      position: { x: 0, y: 0 },
      hidden: focusMode && searchQuery ? !activeNodes.has(n.id) : false,
      data: { label: n.label, type: n.type },
    }));

    const { nodes, edges } = getLayoutedElements(mappedNodes, mappedEdges, 'LR');
    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [storeNodes, storeEdges, loading, searchQuery, focusMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Export handlers providing HD downloads embedding soft watermark logic
  const handleExportPng = useCallback(async () => {
    if (!flowRef.current) return;
    try {
      const dataUrl = await toPng(flowRef.current, { 
        backgroundColor: '#09090b',
        pixelRatio: 2.5,
        filter: (node) => !(node?.classList?.contains('react-flow__panel') || node?.classList?.contains('react-flow__controls'))
      });
      const a = document.createElement('a');
      a.setAttribute('download', `${title ? title.replace(/[^a-z0-9]/gi, '_') : 'Knowledge_Graph'}.png`);
      a.setAttribute('href', dataUrl);
      a.click();
    } catch {
      console.error('Failed to export graph image');
    }
  }, [title]);

  const handleExportJson = useCallback(() => {
    const raw = JSON.stringify({ title, nodes: storeNodes, edges: storeEdges }, null, 2);
    const blob = new Blob([raw], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title ? title.replace(/[^a-z0-9]/gi, '_') : 'Knowledge_Graph'}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [title, storeNodes, storeEdges]);

  if (storeNodes.length === 0) {
    if (loading) {
      return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-50" />
          <div className="relative w-[600px] h-[400px] opacity-20">
            <div className="absolute top-[20%] left-[10%] w-32 h-16 bg-zinc-800 rounded-xl animate-pulse" />
            <div className="absolute top-[50%] left-[45%] w-40 h-20 bg-zinc-700 rounded-xl animate-pulse delay-150" />
            <div className="absolute top-[30%] right-[10%] w-32 h-16 bg-zinc-800 rounded-xl animate-pulse delay-300" />
            <div className="absolute bottom-[20%] right-[30%] w-32 h-16 bg-zinc-800 rounded-xl animate-pulse delay-500" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="20%" y1="25%" x2="45%" y2="55%" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="60%" y1="58%" x2="85%" y2="35%" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse delay-150" />
            </svg>
          </div>
          <div className="mt-8 z-10 flex flex-col items-center">
            <h3 className="text-xl font-medium text-emerald-400 animate-pulse tracking-wide">Processing Architecture...</h3>
          </div>
        </div>
      );
    }
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 pointer-events-none" />
        <h3 className="text-2xl font-semibold text-zinc-400">Concept Map Empty</h3>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-zinc-950 relative" ref={flowRef}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={2} color="#3f3f46" />
        <Controls className="bg-zinc-900 border-zinc-800 fill-zinc-400 shadow-2xl" />
        
        <MiniMap 
          nodeColor={(n: any) => {
            const t = n.data?.type;
            if(t === 'system') return '#3b82f6';
            if(t === 'concept') return '#10b981';
            if(t === 'protocol') return '#8b5cf6';
            if(t === 'component') return '#f59e0b';
            return '#71717a';
          }}
          maskColor="rgba(9, 9, 11, 0.85)" 
          className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl" 
        />
        
        {title && (
          <Panel position="top-center" className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800/80 px-6 py-2.5 rounded-full shadow-2xl mt-4">
            <h1 className="text-emerald-400 font-medium text-sm tracking-wide">{title}</h1>
          </Panel>
        )}

        <Panel position="top-right" className="flex gap-2">
           <button onClick={handleExportJson} className="flex border border-zinc-800 items-center justify-center bg-zinc-900 text-zinc-400 hover:text-white px-3 py-1.5 rounded-md text-xs transition-colors shadow-2xl hover:bg-zinc-800">
             <Database className="w-3.5 h-3.5 mr-2" /> JSON
           </button>
           <button onClick={handleExportPng} className="flex border border-violet-800 bg-violet-900/30 text-violet-400 hover:text-violet-300 hover:bg-violet-900/60 items-center justify-center px-3 py-1.5 rounded-md text-xs transition-colors shadow-2xl">
             <Download className="w-3.5 h-3.5 mr-2" /> HD PNG
           </button>
        </Panel>
        
        {/* Export Watermark (Hidden mostly, caught in html-to-image) */}
        <div className="absolute bottom-4 right-4 text-zinc-700/50 font-mono text-[10px] pointer-events-none opacity-50 z-[-1] !-z-50">
          Generated with Knowledge Graph Builder
        </div>
      </ReactFlow>
    </div>
  );
}

export default function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasCore />
    </ReactFlowProvider>
  );
}
