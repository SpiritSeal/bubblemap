import { node } from './types';

// Well-known ID of the root node. Legacy documents used numeric IDs minted
// as max(id)+1 with the root at 0; normalizeNodes coerces those to strings,
// so '0' stays the root ID for old and new maps alike.
export const ROOT_NODE_ID = '0';

export const mintNodeID = (): string => crypto.randomUUID();

export const createRootNode = (text: string): node => ({
  id: ROOT_NODE_ID,
  parent: ROOT_NODE_ID,
  text,
});

// Coerce Firestore data (possibly legacy numeric IDs, possibly malformed)
// into well-formed nodes. Always returns fresh objects, so callers may
// mutate the result without touching the source snapshot.
export const normalizeNodes = (rawNodes: unknown): node[] => {
  if (!Array.isArray(rawNodes)) return [];
  return rawNodes.flatMap((raw: unknown): node[] => {
    if (typeof raw !== 'object' || raw === null) return [];
    const { id, parent, text } = raw as Record<string, unknown>;
    if (
      (typeof id === 'string' || typeof id === 'number') &&
      (typeof parent === 'string' || typeof parent === 'number') &&
      typeof text === 'string'
    ) {
      return [{ id: String(id), parent: String(parent), text }];
    }
    return [];
  });
};

// The with* functions below are pure: they take the freshly-read node list
// (inside a Firestore transaction) and return the list to write back.

export const withNodeAdded = (nodes: node[], newNode: node): node[] => {
  if (nodes.some((o) => o.id === newNode.id)) return nodes;
  // If the parent vanished in a concurrent delete, attach to the root
  // rather than creating an orphan the tree traversal can never reach.
  const parentExists = nodes.some((o) => o.id === newNode.parent);
  return [
    ...nodes,
    parentExists ? newNode : { ...newNode, parent: ROOT_NODE_ID },
  ];
};

export const withNodeUpdated = (nodes: node[], updatedNode: node): node[] =>
  // No-op when the node is gone (concurrent delete) — don't resurrect it.
  nodes.map((o) =>
    o.id === updatedNode.id
      ? { id: o.id, parent: updatedNode.parent, text: updatedNode.text }
      : o,
  );

export const withNodeDeleted = (nodes: node[], nodeID: string): node[] => {
  if (nodeID === ROOT_NODE_ID) return nodes;
  const nodeToDelete = nodes.find((o) => o.id === nodeID);
  if (!nodeToDelete) return nodes;
  // Direct children move up one level; deeper descendants keep their parents.
  return nodes
    .filter((o) => o.id !== nodeID)
    .map((o) =>
      o.parent === nodeID ? { ...o, parent: nodeToDelete.parent } : o,
    );
};
