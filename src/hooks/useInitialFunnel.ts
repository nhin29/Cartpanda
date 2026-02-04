import type { FunnelNode, FunnelEdge } from '../types';
import { deserializeFunnel } from '../utils/serialization';
import { DEFAULT_FUNNEL_NODES, DEFAULT_FUNNEL_EDGES } from '../constants';
import { FUNNEL_STORAGE_KEY } from '../constants';

/**
 * Load initial funnel from localStorage or return defaults.
 * Safe to call in useState initializer (runs once, no hooks).
 */
export function getInitialFunnel(): {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
} {
  if (typeof window === 'undefined' || !window.localStorage)
    return { nodes: DEFAULT_FUNNEL_NODES, edges: DEFAULT_FUNNEL_EDGES };
  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return { nodes: DEFAULT_FUNNEL_NODES, edges: DEFAULT_FUNNEL_EDGES };
    const parsed = JSON.parse(raw) as unknown;
    const result = deserializeFunnel(parsed);
    return result ?? { nodes: DEFAULT_FUNNEL_NODES, edges: DEFAULT_FUNNEL_EDGES };
  } catch {
    return { nodes: DEFAULT_FUNNEL_NODES, edges: DEFAULT_FUNNEL_EDGES };
  }
}
