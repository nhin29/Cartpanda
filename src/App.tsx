import { useCallback, useRef, useState } from 'react';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
} from 'reactflow';
import { FunnelCanvas } from './components/canvas';
import { Palette } from './components/palette';
import { ExportImportButtons, ValidationPanel } from './components/ui';
import type { FunnelNode, FunnelEdge } from './types';
import type { NodeType } from './types';
import type { SerializedFunnel } from './types';
import { getInitialFunnel } from './hooks';
import { useFunnelPersistence } from './hooks';
import {
  getDefaultTitleForNewNode,
  serializeFunnel,
  deserializeFunnel,
  getFunnelValidationMessages,
} from './utils';

const MAX_HISTORY = 50;

function App() {
  const [funnelState, setFunnelState] = useState(getInitialFunnel);
  const [paletteOpen, setPaletteOpen] = useState(true);
  const [past, setPast] = useState<SerializedFunnel[]>([]);
  const [future, setFuture] = useState<SerializedFunnel[]>([]);
  const skipHistoryRef = useRef(false);
  const { nodes, edges } = funnelState;

  const pushHistory = useCallback(() => {
    if (skipHistoryRef.current) return;
    setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), serializeFunnel(nodes, edges)]);
    setFuture([]);
  }, [nodes, edges]);

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
    (changes: Parameters<typeof applyNodeChanges>[0]) => {
      const shouldPush = changes.some((c) => c.type === 'remove' || c.type === 'add');
      if (shouldPush) pushHistory();
      setNodes((prev) => applyNodeChanges(changes, prev) as FunnelNode[]);
    },
    [setNodes, pushHistory]
  );
  const onEdgesChange = useCallback(
    (changes: Parameters<typeof applyEdgeChanges>[0]) => {
      const shouldPush = changes.some((c) => c.type === 'remove' || c.type === 'add');
      if (shouldPush) pushHistory();
      setEdges((prev) => applyEdgeChanges(changes, prev));
    },
    [setEdges, pushHistory]
  );
  const onNodesDelete = useCallback(
    (nodesToRemove: { id: string }[]) => {
      pushHistory();
      const ids = new Set(nodesToRemove.map((n) => n.id));
      setNodes((prev) => prev.filter((n) => !ids.has(n.id)));
      setEdges((prev) =>
        prev.filter((e) => !ids.has(e.source) && !ids.has(e.target))
      );
    },
    [setNodes, setEdges, pushHistory]
  );
  const onEdgesDelete = useCallback(
    (edgesToRemove: { id: string }[]) => {
      pushHistory();
      const ids = new Set(edgesToRemove.map((e) => e.id));
      setEdges((prev) => prev.filter((e) => !ids.has(e.id)));
    },
    [setEdges, pushHistory]
  );
  const onConnect = useCallback(
    (connection: Connection) => {
      pushHistory();
      setEdges((prev) => addEdge(connection, prev));
    },
    [setEdges, pushHistory]
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
      pushHistory();
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
    [setNodes, pushHistory]
  );
  const undo = useCallback(() => {
    if (past.length === 0) return;
    const restored = past[past.length - 1];
    const result = deserializeFunnel(restored);
    if (!result) return;
    setPast((p) => p.slice(0, -1));
    setFuture((f) => [serializeFunnel(nodes, edges), ...f]);
    skipHistoryRef.current = true;
    setFunnelState({ nodes: result.nodes, edges: result.edges });
    setTimeout(() => { skipHistoryRef.current = false; }, 0);
  }, [past, nodes, edges]);
  const redo = useCallback(() => {
    if (future.length === 0) return;
    const restored = future[0];
    const result = deserializeFunnel(restored);
    if (!result) return;
    setFuture((f) => f.slice(1));
    setPast((p) => [...p.slice(-(MAX_HISTORY - 1)), serializeFunnel(nodes, edges)]);
    skipHistoryRef.current = true;
    setFunnelState({ nodes: result.nodes, edges: result.edges });
    setTimeout(() => { skipHistoryRef.current = false; }, 0);
  }, [future, nodes, edges]);
  const onImport = useCallback(
    (importedNodes: FunnelNode[], importedEdges: FunnelEdge[]) => {
      setFunnelState({ nodes: importedNodes, edges: importedEdges });
    },
    []
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-canvas)]">
      <header className="shrink-0 flex items-center justify-between gap-6 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPaletteOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-primary)] transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-canvas)] hover:text-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1"
            aria-expanded={paletteOpen}
            aria-label={paletteOpen ? 'Close palette' : 'Open palette'}
          >
            <span aria-hidden className="text-sm font-medium">
              {paletteOpen ? '◀' : '▶'}
            </span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-[var(--color-primary)]">
            Cartpanda
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={undo}
            disabled={past.length === 0}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-canvas)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--color-surface)]"
            aria-label="Undo"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={future.length === 0}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-canvas)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-[var(--color-surface)]"
            aria-label="Redo"
          >
            Redo
          </button>
          <span className="mx-1 h-5 w-px bg-[var(--color-border)]" aria-hidden />
          <ExportImportButtons
            nodes={nodes}
            edges={edges}
            onImport={onImport}
          />
        </div>
      </header>
      <div className="flex-1 min-h-0 flex">
        {paletteOpen && (
          <div className="flex w-56 shrink-0 flex-col overflow-hidden border-r border-[var(--color-border)] bg-[var(--color-surface)]">
            <Palette />
            <ValidationPanel messages={getFunnelValidationMessages(nodes, edges)} />
          </div>
        )}
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
