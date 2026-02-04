import type { NodeType } from '../types';
import type { FunnelNode } from '../types';
import { NODE_TYPE_LABELS } from '../constants';

/**
 * Next "Upsell N" label based on existing nodes (e.g. Upsell 1, Upsell 2).
 */
export function getNextUpsellLabel(nodes: FunnelNode[]): string {
  const max = nodes
    .filter((n) => n.type === 'upsell')
    .map((n) => {
      const m = n.data.title.match(/^Upsell (\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);
  return `Upsell ${max + 1}`;
}

/**
 * Next "Downsell N" label based on existing nodes.
 */
export function getNextDownsellLabel(nodes: FunnelNode[]): string {
  const max = nodes
    .filter((n) => n.type === 'downsell')
    .map((n) => {
      const m = n.data.title.match(/^Downsell (\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    })
    .reduce((a, b) => Math.max(a, b), 0);
  return `Downsell ${max + 1}`;
}

/**
 * Default title for a new node of the given type (auto-increment for Upsell/Downsell).
 */
export function getDefaultTitleForNewNode(type: NodeType, nodes: FunnelNode[]): string {
  if (type === 'upsell') return getNextUpsellLabel(nodes);
  if (type === 'downsell') return getNextDownsellLabel(nodes);
  return NODE_TYPE_LABELS[type].label;
}
