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
      className="flex min-h-0 flex-1 flex-col"
      aria-label="Node palette"
    >
      <section className="flex flex-col p-4" aria-labelledby="palette-heading">
        <h2
          id="palette-heading"
          className="mb-3 text-xs font-medium uppercase tracking-wider text-[var(--color-primary-muted)]"
        >
          Drag to canvas
        </h2>
        <ul className="flex flex-col gap-1.5" role="list">
          {NODE_TYPES.map((type) => {
            const { label } = NODE_TYPE_LABELS[type];
            const icon = NODE_ICONS[type];
            return (
              <li key={type}>
                <div
                  className="flex cursor-grab items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--color-primary)] transition-colors hover:bg-[var(--color-canvas)] active:cursor-grabbing active:bg-[var(--color-border)]"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/reactflow-node-type', type);
                    e.dataTransfer.effectAllowed = 'move';
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Add ${label} to canvas`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') e.preventDefault();
                  }}
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-canvas)] text-base"
                    aria-hidden
                  >
                    {icon}
                  </span>
                  <span className="truncate font-medium">{label}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </aside>
  );
}
