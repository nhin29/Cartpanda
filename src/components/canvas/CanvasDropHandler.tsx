import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import type { NodeType } from '../../types';

export interface CanvasDropHandlerProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onDropEnd: () => void;
}

/**
 * Renders an overlay that captures drop from palette and converts screen coords to flow coords.
 * Must be a child of ReactFlow so useReactFlow() is available.
 */
export function CanvasDropHandler({ onAddNode, onDropEnd }: CanvasDropHandlerProps) {
  const { screenToFlowPosition } = useReactFlow();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDropEnd();
      const type = e.dataTransfer.getData('application/reactflow-node-type') as NodeType;
      if (!type) return;
      const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      onAddNode(type, position);
    },
    [onAddNode, onDropEnd, screenToFlowPosition]
  );

  return (
    <div
      className="absolute inset-0 z-10"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      aria-hidden
    />
  );
}
