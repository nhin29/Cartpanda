import type { NodeType } from '../../types';
import { NODE_TYPES, NODE_TYPE_LABELS } from '../../constants';

const NODE_ICONS: Record<NodeType, string> = {
  salesPage: '📄',
  orderPage: '🛒',
  upsell: '⬆️',
  downsell: '⬇️',
  thankYou: '✅',
};

export function Palette() {
  return (
    <aside
      className="shrink-0 w-52 border-r border-[var(--color-border)] bg-[var(--color-surface)] p-3"
      aria-label="Node palette"
    >
      <h2 className="mb-3 text-sm font-semibold text-[var(--color-primary)]">
        Add node
      </h2>
      <ul className="flex flex-col gap-1" role="list">
        {NODE_TYPES.map((type) => {
          const { label } = NODE_TYPE_LABELS[type];
          const icon = NODE_ICONS[type];
          return (
            <li key={type}>
              <div
                className="flex cursor-grab items-center gap-2 rounded border border-[var(--color-border)] bg-[var(--color-canvas)] px-3 py-2 text-sm text-[var(--color-primary)] hover:border-[var(--color-accent)] active:cursor-grabbing"
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('application/reactflow-node-type', type);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                role="button"
                tabIndex={0}
                aria-label={`Add ${label} to canvas`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    (e.currentTarget as HTMLDivElement).click();
                  }
                }}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[var(--color-border)] text-base">
                  {icon}
                </span>
                <span className="truncate font-medium">{label}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
