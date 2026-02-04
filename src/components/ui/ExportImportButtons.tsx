import { useRef } from 'react';
import type { FunnelNode, FunnelEdge } from '../../types';
import { serializeFunnel, deserializeFunnel } from '../../utils';

export interface ExportImportButtonsProps {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
  onImport: (nodes: FunnelNode[], edges: FunnelEdge[]) => void;
}

export function ExportImportButtons({
  nodes,
  edges,
  onImport,
}: ExportImportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = serializeFunnel(nodes, edges);
    const blob = new Blob([JSON.stringify(json, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'funnel.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const parsed = JSON.parse(text) as unknown;
        const result = deserializeFunnel(parsed);
        if (result) {
          onImport(result.nodes, result.edges);
        }
      } catch {
        // invalid file - could show toast
      }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        aria-hidden
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleExport}
        className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-border)]"
      >
        Export JSON
      </button>
      <button
        type="button"
        onClick={handleImportClick}
        className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-border)]"
      >
        Import JSON
      </button>
    </div>
  );
}
