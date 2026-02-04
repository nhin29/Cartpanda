import type { NodeTypes } from 'reactflow';
import { SalesPageNode } from './SalesPageNode';
import { OrderPageNode } from './OrderPageNode';
import { UpsellNode } from './UpsellNode';
import { DownsellNode } from './DownsellNode';
import { ThankYouNode } from './ThankYouNode';

export const funnelNodeTypes: NodeTypes = {
  salesPage: SalesPageNode,
  orderPage: OrderPageNode,
  upsell: UpsellNode,
  downsell: DownsellNode,
  thankYou: ThankYouNode,
};

export { SalesPageNode, OrderPageNode, UpsellNode, DownsellNode, ThankYouNode };
export { BaseFunnelNode } from './BaseFunnelNode';
export type { BaseFunnelNodeProps } from './BaseFunnelNode';
