import type { NodeType } from '../types';

/**
 * Display label and static primary button label per node type.
 */
export const NODE_TYPE_LABELS: Record<NodeType, { label: string; buttonLabel: string }> = {
  salesPage: { label: 'Sales Page', buttonLabel: 'Learn More' },
  orderPage: { label: 'Order Page', buttonLabel: 'Order Now' },
  upsell: { label: 'Upsell', buttonLabel: 'Add to Order' },
  downsell: { label: 'Downsell', buttonLabel: 'Add to Order' },
  thankYou: { label: 'Thank You', buttonLabel: 'Done' },
};

export const NODE_TYPES: NodeType[] = [
  'salesPage',
  'orderPage',
  'upsell',
  'downsell',
  'thankYou',
];
