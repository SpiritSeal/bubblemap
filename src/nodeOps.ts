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

// One node's part in a committed transaction: `before` only = deleted,
// `after` only = added, both = updated. A committed transaction records a
// list of these, and undo inverts them against the then-current doc.
export interface NodeChange {
  before?: node;
  after?: node;
}

const sameNode = (a: node, b: node): boolean =>
  a.id === b.id && a.parent === b.parent && a.text === b.text;

export const diffNodes = (before: node[], after: node[]): NodeChange[] => {
  const changes: NodeChange[] = [];
  const afterByID = new Map(after.map((o) => [o.id, o]));
  before.forEach((prev) => {
    const next = afterByID.get(prev.id);
    if (!next) changes.push({ before: prev });
    else if (!sameNode(prev, next)) changes.push({ before: prev, after: next });
  });
  const beforeIDs = new Set(before.map((o) => o.id));
  after.forEach((next) => {
    if (!beforeIDs.has(next.id)) changes.push({ after: next });
  });
  return changes;
};

// Inverts one recorded change set against the current node list. Each piece
// applies only if the affected node still looks the way the recorded
// operation left it, so undo never clobbers or resurrects over a newer
// remote edit — conflicting pieces are skipped, not merged. Returns the
// input array unchanged (same reference) when nothing applies.
export const withChangesUndone = (
  nodes: node[],
  changes: NodeChange[],
): node[] => {
  let result = nodes;
  // Re-add deleted nodes first, so children the delete reparented get their
  // old parent back before their parent pointers are restored below.
  changes.forEach(({ before, after }) => {
    if (before && !after && !result.some((o) => o.id === before.id)) {
      result = withNodeAdded(result, before);
    }
  });
  changes.forEach(({ before, after }) => {
    if (!before || !after) return;
    const current = result.find((o) => o.id === after.id);
    if (!current || !sameNode(current, after)) return;
    const parentExists = result.some((o) => o.id === before.parent);
    result = withNodeUpdated(
      result,
      parentExists ? before : { ...before, parent: ROOT_NODE_ID },
    );
  });
  changes.forEach(({ before, after }) => {
    if (before || !after) return;
    const current = result.find((o) => o.id === after.id);
    if (current && sameNode(current, after)) {
      result = withNodeDeleted(result, after.id);
    }
  });
  return result;
};
