import type { FunnelNode, FunnelEdge } from '../types';

export interface ValidationMessage {
  id: string;
  text: string;
}

/**
 * Compute validation messages for the funnel (orphans, Sales Page rules).
 */
export function getFunnelValidationMessages(
  nodes: FunnelNode[],
  edges: FunnelEdge[]
): ValidationMessage[] {
  const messages: ValidationMessage[] = [];
  const nodeIds = new Set(nodes.map((n) => n.id));
  const outBySource = new Map<string, number>();
  const inByTarget = new Map<string, number>();
  for (const e of edges) {
    if (nodeIds.has(e.source)) outBySource.set(e.source, (outBySource.get(e.source) ?? 0) + 1);
    if (nodeIds.has(e.target)) inByTarget.set(e.target, (inByTarget.get(e.target) ?? 0) + 1);
  }
  let orphanCount = 0;
  for (const n of nodes) {
    const out = outBySource.get(n.id) ?? 0;
    const in_ = inByTarget.get(n.id) ?? 0;
    if (out === 0 && in_ === 0) orphanCount++;
  }
  if (orphanCount > 0) {
    messages.push({
      id: 'orphans',
      text: `This funnel has ${orphanCount} orphan node${orphanCount > 1 ? 's' : ''}.`,
    });
  }
  const salesPageInvalid = nodes.filter((n) => {
    if (n.type !== 'salesPage') return false;
    const out = outBySource.get(n.id) ?? 0;
    return out !== 1;
  });
  if (salesPageInvalid.length > 0) {
    messages.push({
      id: 'sales-page',
      text: `Sales Page has invalid connections (should have exactly one outgoing).`,
    });
  }
  return messages;
}
