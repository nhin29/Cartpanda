import { Handle, Position, useReactFlow, type NodeProps } from 'reactflow';
import type { FunnelNodeData } from '../../types';

export interface BaseFunnelNodeProps extends NodeProps<FunnelNodeData> {
  buttonLabel: string;
  icon?: React.ReactNode;
}

/**
 * Shared layout for funnel nodes: title, icon placeholder, primary button label.
 * Handles for connections: target (left), source (right).
 * Sales Page: show visual warning when it does not have exactly one outgoing edge.
 */
export function BaseFunnelNode({
  id,
  data,
  type,
  selected,
  buttonLabel,
  icon,
}: BaseFunnelNodeProps) {
  const { getEdges } = useReactFlow();
  const edges = getEdges();
  const outgoingCount = edges.filter((e) => e.source === id).length;
  const isSalesPageInvalid =
    type === 'salesPage' && (outgoingCount === 0 || outgoingCount > 1);

  return (
    <div
      className={`
        min-w-[160px] rounded-lg border-2 bg-[var(--color-surface)] px-3 py-2 shadow-sm
        ${selected ? 'border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/20' : 'border-[var(--color-border)]'}
        ${isSalesPageInvalid ? 'border-[var(--color-invalid)]' : ''}
      `}
    >
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !-left-1" />
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-[var(--color-border)] text-[var(--color-primary-muted)] text-sm">
          {icon ?? '·'}
        </div>
        <span className="font-medium text-sm text-[var(--color-primary)] truncate">
          {data.title || 'Untitled'}
        </span>
      </div>
      {isSalesPageInvalid && (
        <p
          className="mb-2 flex items-center gap-1 text-xs text-[var(--color-invalid)]"
          role="status"
          aria-live="polite"
        >
          <span aria-hidden>⚠</span>
          Should have exactly one outgoing connection
        </p>
      )}
      <button
        type="button"
        className="w-full rounded border border-[var(--color-border)] bg-[var(--color-primary)] px-2 py-1.5 text-xs font-medium text-white hover:opacity-90"
        disabled
        aria-hidden
      >
        {buttonLabel}
      </button>
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !-right-1" />
    </div>
  );
}
