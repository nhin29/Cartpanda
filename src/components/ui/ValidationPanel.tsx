import type { ValidationMessage } from '../../utils';

export interface ValidationPanelProps {
  messages: ValidationMessage[];
}

export function ValidationPanel({ messages }: ValidationPanelProps) {
  if (messages.length === 0) return null;
  return (
    <section
      className="border-t border-[var(--color-border)] bg-[var(--color-canvas)]/50 px-4 py-3"
      role="status"
      aria-live="polite"
      aria-label="Funnel validation"
    >
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-[var(--color-primary-muted)]">
        Validation
      </p>
      <ul className="space-y-1.5 text-sm text-[var(--color-primary-muted)]">
        {messages.map((m) => (
          <li key={m.id} className="flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-invalid)]" aria-hidden />
            <span>{m.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
