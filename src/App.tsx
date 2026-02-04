import { useCallback, useState } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from 'reactflow';
import { FunnelCanvas } from './components/canvas';
import { Palette } from './components/palette';
import type { FunnelNode, FunnelEdge } from './types';
import type { NodeType } from './types';
import { DEFAULT_FUNNEL_NODES, DEFAULT_FUNNEL_EDGES } from './constants';
import { getDefaultTitleForNewNode } from './utils';

function App() {
  const [nodes, setNodes] = useState<FunnelNode[]>(DEFAULT_FUNNEL_NODES);
  const [edges, setEdges] = useState<FunnelEdge[]>(DEFAULT_FUNNEL_EDGES);

  const onNodesChange = useCallback(
    (changes: Parameters<typeof applyNodeChanges>[0]) =>
      setNodes((prev) => applyNodeChanges(changes, prev) as FunnelNode[]),
    []
  );
  const onEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) =>
      setEdges((prev) => applyEdgeChanges(changes, prev)),
    []
  );
  const onNodesDelete = useCallback(
    (nodesToRemove: { id: string }[]) => {
      const ids = new Set(nodesToRemove.map((n) => n.id));
      setNodes((prev) => prev.filter((n) => !ids.has(n.id)));
      setEdges((prev) =>
        prev.filter((e) => !ids.has(e.source) && !ids.has(e.target))
      );
    },
    []
  );
  const onEdgesDelete = useCallback(
    (edgesToRemove: { id: string }[]) => {
      const ids = new Set(edgesToRemove.map((e) => e.id));
      setEdges((prev) => prev.filter((e) => !ids.has(e.id)));
    },
    []
  );
  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((prev) => addEdge(connection, prev)),
    []
  );
  const isValidConnection = useCallback(
    (connection: Connection) => {
      const source = connection.source ?? null;
      if (!source) return false;
      const sourceNode = nodes.find((n) => n.id === source);
      return sourceNode?.type !== 'thankYou';
    },
    [nodes]
  );

  const onAddNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    setNodes((prev) => {
      const id = `${type}-${Date.now()}`;
      const title = getDefaultTitleForNewNode(type, prev);
      const newNode: FunnelNode = {
        id,
        type,
        position,
        data: { title },
      };
      return [...prev, newNode];
    });
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-canvas)]">
      <header className="shrink-0 px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <h1 className="text-lg font-semibold text-[var(--color-primary)]">
          Funnel Builder
        </h1>
      </header>
      <div className="flex-1 min-h-0 flex">
        <Palette />
        <main className="flex-1 min-h-0">
          <FunnelCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onConnect={onConnect}
            onAddNode={onAddNode}
            isValidConnection={isValidConnection}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
