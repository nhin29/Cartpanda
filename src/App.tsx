import { useState } from 'react';
import { FunnelCanvas } from './components/canvas';
import { Palette } from './components/palette';
import type { FunnelNode, FunnelEdge } from './types';
import { DEFAULT_FUNNEL_NODES, DEFAULT_FUNNEL_EDGES } from './constants';

function App() {
  const [nodes] = useState<FunnelNode[]>(DEFAULT_FUNNEL_NODES);
  const [edges] = useState<FunnelEdge[]>(DEFAULT_FUNNEL_EDGES);

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
            onNodesChange={() => {}}
            onEdgesChange={() => {}}
            onConnect={() => {}}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
