import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
} from 'reactflow';
import type { FunnelNode, FunnelEdge } from '../../types';
import type { NodeType } from '../../types';
import { funnelNodeTypes } from '../nodes';
import { CanvasDropHandler } from './CanvasDropHandler';

export interface FunnelCanvasProps {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onConnect?: OnConnect;
  onAddNode?: (type: NodeType, position: { x: number; y: number }) => void;
}

export function FunnelCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
}: FunnelCanvasProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleNodesChange = useCallback<OnNodesChange>(
    (changes) => onNodesChange?.(changes),
    [onNodesChange]
  );
  const handleEdgesChange = useCallback<OnEdgesChange>(
    (changes) => onEdgesChange?.(changes),
    [onEdgesChange]
  );
  const handleConnect = useCallback<OnConnect>(
    (connection) => onConnect?.(connection),
    [onConnect]
  );
  const handleDropEnd = useCallback(() => setIsDragOver(false), []);

  return (
    <div
      className="h-full w-full"
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={(e) => {
        const related = e.relatedTarget as HTMLElement | null;
        if (!related || !e.currentTarget.contains(related)) setIsDragOver(false);
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={funnelNodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable
        nodesConnectable
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        {isDragOver && onAddNode && (
          <CanvasDropHandler onAddNode={onAddNode} onDropEnd={handleDropEnd} />
        )}
      </ReactFlow>
    </div>
  );
}
