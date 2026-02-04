import type { FunnelNode, FunnelEdge } from '../types';
import { deserializeFunnel } from '../utils/serialization';
import { FUNNEL_STORAGE_KEY } from '../constants';

const EMPTY_FUNNEL = { nodes: [] as FunnelNode[], edges: [] as FunnelEdge[] };

/**
 * Load initial funnel from localStorage or empty canvas.
 * Safe to call in useState initializer (runs once, no hooks).
 */
export function getInitialFunnel(): {
  nodes: FunnelNode[];
  edges: FunnelEdge[];
} {
  if (typeof window === 'undefined' || !window.localStorage) return EMPTY_FUNNEL;
  try {
    const raw = localStorage.getItem(FUNNEL_STORAGE_KEY);
    if (!raw) return EMPTY_FUNNEL;
    const parsed = JSON.parse(raw) as unknown;
    const result = deserializeFunnel(parsed);
    return result ?? EMPTY_FUNNEL;
  } catch {
    return EMPTY_FUNNEL;
  }
}
