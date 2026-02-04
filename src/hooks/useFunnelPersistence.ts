import { useEffect, useRef } from 'react';
import type { FunnelNode, FunnelEdge } from '../types';
import { serializeFunnel } from '../utils/serialization';
import { FUNNEL_STORAGE_KEY } from '../constants';

const DEBOUNCE_MS = 500;

/**
 * Persist funnel to localStorage (debounced) whenever nodes or edges change.
 */
export function useFunnelPersistence(
  nodes: FunnelNode[],
  edges: FunnelEdge[]
): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      try {
        const json = serializeFunnel(nodes, edges);
        localStorage.setItem(FUNNEL_STORAGE_KEY, JSON.stringify(json));
      } catch {
        // ignore write errors
      }
      timeoutRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nodes, edges]);
}
