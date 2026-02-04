import type { FunnelNode, FunnelEdge } from '../types';

/**
 * Initial funnel state: Sales Page → Order Page → Thank You.
 * Used when no saved funnel exists (empty state alternative).
 */
export const DEFAULT_FUNNEL_NODES: FunnelNode[] = [
  {
    id: 'sales-1',
    type: 'salesPage',
    position: { x: 100, y: 100 },
    data: { title: 'Sales Page' },
  },
  {
    id: 'order-1',
    type: 'orderPage',
    position: { x: 400, y: 100 },
    data: { title: 'Order Page' },
  },
  {
    id: 'thankyou-1',
    type: 'thankYou',
    position: { x: 700, y: 100 },
    data: { title: 'Thank You' },
  },
];

export const DEFAULT_FUNNEL_EDGES: FunnelEdge[] = [
  { id: 'e-sales-order', source: 'sales-1', target: 'order-1' },
  { id: 'e-order-thankyou', source: 'order-1', target: 'thankyou-1' },
];
