import type {
  FunnelNode,
  FunnelEdge,
  SerializedFunnel,
  SerializedNode,
  SerializedEdge,
  NodeType,
} from '../types';

const NODE_TYPES: NodeType[] = [
  'salesPage',
  'orderPage',
  'upsell',
  'downsell',
  'thankYou',
];

function isNodeType(s: string): s is NodeType {
  return NODE_TYPES.includes(s as NodeType);
}

function isSerializedNode(v: unknown): v is SerializedNode {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    isNodeType(String(o.type)) &&
    typeof o.position === 'object' &&
    o.position !== null &&
    typeof (o.position as { x: number; y: number }).x === 'number' &&
    typeof (o.position as { x: number; y: number }).y === 'number' &&
    typeof o.data === 'object' &&
    o.data !== null &&
    typeof (o.data as { title: string }).title === 'string'
  );
}

function isSerializedEdge(v: unknown): v is SerializedEdge {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.id === 'string' &&
    typeof o.source === 'string' &&
    typeof o.target === 'string'
  );
}

/**
 * Serialize current funnel state to JSON-safe shape.
 */
export function serializeFunnel(
  nodes: FunnelNode[],
  edges: FunnelEdge[]
): SerializedFunnel {
  const serializedNodes: SerializedNode[] = nodes.map((n) => ({
    id: n.id,
    type: n.type as NodeType,
    position: { ...n.position },
    data: { title: n.data.title },
  }));
  const serializedEdges: SerializedEdge[] = edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
  }));
  return { nodes: serializedNodes, edges: serializedEdges };
}

/**
 * Deserialize JSON to funnel state. Returns null if shape is invalid.
 */
export function deserializeFunnel(
  data: unknown
): { nodes: FunnelNode[]; edges: FunnelEdge[] } | null {
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (!Array.isArray(o.nodes) || !Array.isArray(o.edges)) return null;
  const nodes: FunnelNode[] = [];
  for (const item of o.nodes) {
    if (!isSerializedNode(item)) return null;
    nodes.push({
      id: item.id,
      type: item.type,
      position: { ...item.position },
      data: { title: item.data.title },
    } as FunnelNode);
  }
  const edges: FunnelEdge[] = [];
  for (const item of o.edges) {
    if (!isSerializedEdge(item)) return null;
    edges.push({ id: item.id, source: item.source, target: item.target });
  }
  return { nodes, edges };
}
