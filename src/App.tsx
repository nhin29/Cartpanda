import { useCallback, useState } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from 'reactflow';
import { FunnelCanvas } from './components/canvas';
import { Palette } from './components/palette';
import { ExportImportButtons } from './components/ui';
import type { FunnelNode, FunnelEdge } from './types';
import type { NodeType } from './types';
import { getInitialFunnel } from './hooks';
import { useFunnelPersistence } from './hooks';
import { getDefaultTitleForNewNode } from './utils';

function App() {
  const [funnelState, setFunnelState] = useState(getInitialFunnel);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const { nodes, edges } = funnelState;

  const setNodes = useCallback(
    (update: React.SetStateAction<FunnelNode[]>) => {
      setFunnelState((prev) => ({
        ...prev,
        nodes: typeof update === 'function' ? update(prev.nodes) : update,
      }));
    },
    []
  );
  const setEdges = useCallback(
    (update: React.SetStateAction<FunnelEdge[]>) => {
      setFunnelState((prev) => ({
        ...prev,
        edges: typeof update === 'function' ? update(prev.edges) : update,
      }));
    },
    []
  );

  useFunnelPersistence(nodes, edges);

  const onNodesChange = useCallback(
    (changes: Parameters<typeof applyNodeChanges>[0]) =>
      setNodes((prev) => applyNodeChanges(changes, prev) as FunnelNode[]),
    [setNodes]
  );
  const onEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) =>
      setEdges((prev) => applyEdgeChanges(changes, prev)),
    [setEdges]
  );
  const onNodesDelete = useCallback(
    (nodesToRemove: { id: string }[]) => {
      const ids = new Set(nodesToRemove.map((n) => n.id));
      setNodes((prev) => prev.filter((n) => !ids.has(n.id)));
      setEdges((prev) =>
        prev.filter((e) => !ids.has(e.source) && !ids.has(e.target))
      );
    },
    [setNodes, setEdges]
  );
  const onEdgesDelete = useCallback(
    (edgesToRemove: { id: string }[]) => {
      const ids = new Set(edgesToRemove.map((e) => e.id));
      setEdges((prev) => prev.filter((e) => !ids.has(e.id)));
    },
    [setEdges]
  );
  const onConnect = useCallback(
    (connection: Connection) => setEdges((prev) => addEdge(connection, prev)),
    [setEdges]
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
  const onAddNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
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
    },
    [setNodes]
  );
  const onImport = useCallback(
    (importedNodes: FunnelNode[], importedEdges: FunnelEdge[]) => {
      setFunnelState({ nodes: importedNodes, edges: importedEdges });
    },
    []
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-canvas)]">
      <header className="shrink-0 flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaletteOpen((o) => !o)}
            className="rounded border border-[var(--color-border)] p-1.5 text-[var(--color-primary)] hover:bg-[var(--color-border)]"
            aria-expanded={paletteOpen}
            aria-label={paletteOpen ? 'Close palette' : 'Open palette'}
          >
            <span aria-hidden>{paletteOpen ? '◀' : '▶'}</span>
          </button>
          <h1 className="text-lg font-semibold text-[var(--color-primary)]">
            Funnel Builder
          </h1>
        </div>
        <ExportImportButtons
          nodes={nodes}
          edges={edges}
          onImport={onImport}
        />
      </header>
      <div className="flex-1 min-h-0 flex">
        {paletteOpen && <Palette />}
        <main className="flex-1 min-h-0" role="main" aria-label="Funnel editor">
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
