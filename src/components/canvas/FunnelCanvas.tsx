import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  MarkerType,
  type OnNodesChange,
  type OnEdgesChange,
  type OnNodesDelete,
  type OnEdgesDelete,
  type OnConnect,
  type Connection,
} from 'reactflow';
import type { FunnelNode, FunnelEdge } from '../../types';
import type { NodeType } from '../../types';
import { funnelNodeTypes } from '../nodes';
import { CanvasDropHandler } from './CanvasDropHandler';
import { EmptyState } from '../ui';

/** Minimap node colors by funnel type for clearer overview. */
const MINIMAP_NODE_COLORS: Record<NodeType, string> = {
  salesPage: '#3b82f6',
  orderPage: '#8b5cf6',
  upsell: '#06b6d4',
  downsell: '#f59e0b',
  thankYou: '#10b981',
};

function getMinimapNodeColor(node: { type?: string }): string {
  return (node.type && MINIMAP_NODE_COLORS[node.type as NodeType]) ?? '#94a3b8';
}

export interface FunnelCanvasProps {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  onNodesChange?: OnNodesChange;
  onEdgesChange?: OnEdgesChange;
  onNodesDelete?: OnNodesDelete;
  onEdgesDelete?: OnEdgesDelete;
  onConnect?: OnConnect;
  onAddNode?: (type: NodeType, position: { x: number; y: number }) => void;
  /** Return false to block a connection (e.g. Thank You has no outgoing edges). */
  isValidConnection?: (connection: Connection) => boolean;
}

export function FunnelCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onNodesDelete,
  onEdgesDelete,
  onConnect,
  onAddNode,
  isValidConnection,
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
      className="relative h-full w-full"
      onDragEnter={() => setIsDragOver(true)}
      onDragLeave={(e) => {
        const related = e.relatedTarget as HTMLElement | null;
        if (!related || !e.currentTarget.contains(related)) setIsDragOver(false);
      }}
      role="application"
      aria-label="Funnel canvas: drag nodes and connect with edges"
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={funnelNodeTypes}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={handleConnect}
        isValidConnection={isValidConnection}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        snapToGrid
        snapGrid={[16, 16]}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={16} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
        <MiniMap
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md"
          nodeColor={getMinimapNodeColor}
          nodeStrokeColor="#e2e8f0"
          nodeStrokeWidth={2}
          nodeBorderRadius={8}
          maskColor="rgba(241, 245, 249, 0.75)"
          maskStrokeColor="rgba(59, 130, 246, 0.4)"
          maskStrokeWidth={1.5}
          pannable
          zoomable
          ariaLabel="Minimap: pan or zoom to navigate the funnel"
        />
        {nodes.length === 0 && <EmptyState />}
        {isDragOver && onAddNode && (
          <CanvasDropHandler onAddNode={onAddNode} onDropEnd={handleDropEnd} />
        )}
      </ReactFlow>
    </div>
  );
}
