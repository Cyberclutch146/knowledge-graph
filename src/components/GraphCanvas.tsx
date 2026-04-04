'use client';

import { useMemo, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  MarkerType,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useGraphStore } from '@/store/useGraphStore';
import NodeCard from './NodeCard';

const nodeTypes = {
  customNode: NodeCard,
};

export default function GraphCanvas() {
  const { nodes: storeNodes, edges: storeEdges, loading } = useGraphStore();

  // We map the store nodes directly
  const layoutedNodes = useMemo(() => {
    // Basic ring layout logic for initial distribution since we don't have a layout engine like dagre
    const radius = Math.max(200, storeNodes.length * 20);
    return storeNodes.map((n, i) => {
      const angle = (i / Math.max(1, storeNodes.length)) * 2 * Math.PI;
      return {
        id: n.id,
        type: 'customNode',
        position: { x: Math.cos(angle) * radius + 400, y: Math.sin(angle) * radius + 300 },
        data: { label: n.label },
      };
    });
  }, [storeNodes]);

  const layoutedEdges = useMemo(() => {
    return storeEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      animated: loading,
      style: { stroke: '#52525b', strokeWidth: 2 },
      labelStyle: { fill: '#a1a1aa', fontWeight: 500 },
      labelBgStyle: { fill: '#18181b', fillOpacity: 0.8 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#52525b',
      },
    }));
  }, [storeEdges, loading]);

  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

  // Sync state when store updates
  useMemo(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  if (storeNodes.length === 0) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-500">
        <div className="w-24 h-24 mb-6 opacity-20 border-4 border-dashed border-zinc-500 rounded-full animate-[spin_10s_linear_infinite]" />
        <h3 className="text-xl font-medium text-zinc-300">Graph Canvas is Empty</h3>
        <p className="mt-2 text-sm max-w-sm text-center">
          Enter text in the Data Source panel and click "Generate Graph" to begin visualizing knowledge.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full bg-zinc-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={4}
        proOptions={{ hideAttribution: true }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={2} 
          color="#27272a" 
        />
        <Controls 
          className="bg-zinc-900 border-zinc-800 fill-zinc-400"
        />
        <MiniMap 
          nodeColor="#10b981" 
          maskColor="rgba(24, 24, 27, 0.7)" 
          className="bg-zinc-900 border-zinc-800 rounded-lg overflow-hidden" 
        />
      </ReactFlow>
    </div>
  );
}
