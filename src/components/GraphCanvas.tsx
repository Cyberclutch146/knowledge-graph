'use client';

import { useMemo, useEffect } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '@/store/useGraphStore';
import NodeCard from './NodeCard';
import { getLayoutedElements } from '@/lib/layoutEngine';

const nodeTypes = {
  customNode: NodeCard,
};

export default function GraphCanvas() {
  const { title, nodes: storeNodes, edges: storeEdges, loading } = useGraphStore();

  const { layoutedNodes, layoutedEdges } = useMemo(() => {
    if (storeNodes.length === 0) return { layoutedNodes: [], layoutedEdges: [] };
    
    // We map edges ensuring target and sources aren't raw objects
    const mappedEdges = storeEdges.map(e => ({
      ...e,
      type: 'smoothstep',
      animated: loading,
      style: { stroke: '#52525b', strokeWidth: 1.5 },
      labelStyle: { fill: '#d4d4d8', fontWeight: 500, fontSize: 11, letterSpacing: '0.05em' },
      labelBgStyle: { fill: '#18181b', fillOpacity: 0.85, stroke: '#27272a', strokeWidth: 1 },
      labelBgPadding: [6, 4] as [number, number],
      labelBgBorderRadius: 4,
      markerEnd: { type: MarkerType.ArrowClosed, color: '#52525b', width: 20, height: 20 },
    }));

    const mappedNodes = storeNodes.map(n => ({
      id: n.id,
      type: 'customNode',
      position: { x: 0, y: 0 },
      data: { label: n.label, type: n.type },
    }));

    const { nodes, edges } = getLayoutedElements(mappedNodes, mappedEdges, 'LR');
    return { layoutedNodes: nodes, layoutedEdges: edges };
  }, [storeNodes, storeEdges, loading]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Sync state cleanly
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  if (storeNodes.length === 0) {
    if (loading) {
      return (
        <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-zinc-950 opacity-50" />
          {/* Skeleton Loader mapped as network structure */}
          <div className="relative w-[600px] h-[400px] opacity-20">
            <div className="absolute top-[20%] left-[10%] w-32 h-16 bg-zinc-800 rounded-xl animate-pulse" />
            <div className="absolute top-[50%] left-[45%] w-40 h-20 bg-zinc-700 rounded-xl animate-pulse delay-150" />
            <div className="absolute top-[30%] right-[10%] w-32 h-16 bg-zinc-800 rounded-xl animate-pulse delay-300" />
            <div className="absolute bottom-[20%] right-[30%] w-32 h-16 bg-zinc-800 rounded-xl animate-pulse delay-500" />
            
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line x1="20%" y1="25%" x2="45%" y2="55%" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              <line x1="60%" y1="58%" x2="85%" y2="35%" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse delay-150" />
              <line x1="55%" y1="65%" x2="70%" y2="78%" stroke="#3f3f46" strokeWidth="2" strokeDasharray="5,5" className="animate-pulse delay-300" />
            </svg>
          </div>
          <div className="mt-8 z-10 flex flex-col items-center">
            <h3 className="text-xl font-medium text-emerald-400 animate-pulse tracking-wide">Processing Knowledge Engine...</h3>
            <p className="text-zinc-500 text-sm mt-2">Generating semantic topologies and cleaning edge boundaries.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 via-zinc-950 to-zinc-950 pointer-events-none" />
        <h3 className="text-2xl font-semibold text-zinc-400">Concept Map Empty</h3>
        <p className="mt-2 text-sm text-center max-w-sm font-light text-zinc-500">
          Inject raw text into the data source panel to extract an architectural graph.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-zinc-950 relative">
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
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={2} 
          color="#3f3f46" 
        />
        <Controls 
          className="bg-zinc-900 border-zinc-800 fill-zinc-400 shadow-2xl"
        />
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
      </ReactFlow>
    </div>
  );
}
