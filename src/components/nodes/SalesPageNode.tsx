import type { NodeProps } from 'reactflow';
import { BaseFunnelNode } from './BaseFunnelNode';
import type { FunnelNodeData } from '../../types';
import { NODE_TYPE_LABELS } from '../../constants';

export function SalesPageNode(props: NodeProps<FunnelNodeData>) {
  return (
    <BaseFunnelNode
      {...props}
      buttonLabel={NODE_TYPE_LABELS.salesPage.buttonLabel}
      icon="📄"
    />
  );
}
