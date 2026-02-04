export function EmptyState() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
      aria-live="polite"
    >
      <p className="max-w-xs rounded-lg bg-[var(--color-surface)]/90 px-4 py-3 text-center text-sm text-[var(--color-primary-muted)] shadow-sm">
        Drag a node from the palette or use Import JSON to load a funnel.
      </p>
    </div>
  );
}
