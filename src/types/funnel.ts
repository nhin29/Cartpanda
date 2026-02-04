import type { Node, Edge } from 'reactflow';

/**
 * The five funnel node types (templates).
 */
export type NodeType =
  | 'salesPage'
  | 'orderPage'
  | 'upsell'
  | 'downsell'
  | 'thankYou';

/**
 * Data attached to each funnel node (React Flow Node.data).
 */
export interface FunnelNodeData {
  title: string;
}

/**
 * Our node type: React Flow Node with funnel data.
 */
export type FunnelNode = Node<FunnelNodeData, NodeType>;

/**
 * Our edge type: React Flow Edge (id, source, target).
 */
export type FunnelEdge = Edge;

/**
 * Serialized node shape for Export/Import and localStorage.
 */
export interface SerializedNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: FunnelNodeData;
}

/**
 * Serialized edge shape for Export/Import and localStorage.
 */
export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
}

/**
 * Full funnel state as persisted (JSON / localStorage).
 */
export interface SerializedFunnel {
  nodes: SerializedNode[];
  edges: SerializedEdge[];
}
