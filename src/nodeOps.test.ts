import { describe, expect, it } from 'vitest';
import {
  createRootNode,
  mintNodeID,
  normalizeNodes,
  ROOT_NODE_ID,
  withNodeAdded,
  withNodeDeleted,
  withNodeUpdated,
} from './nodeOps';
import { node } from './types';

const tree: node[] = [
  { id: ROOT_NODE_ID, parent: ROOT_NODE_ID, text: 'root' },
  { id: 'a', parent: ROOT_NODE_ID, text: 'a' },
  { id: 'b', parent: 'a', text: 'b' },
  { id: 'c', parent: 'b', text: 'c' },
];

describe('mintNodeID', () => {
  it('mints unique string IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, mintNodeID));
    expect(ids.size).toBe(100);
    ids.forEach((id) => expect(typeof id).toBe('string'));
  });
});

describe('createRootNode', () => {
  it('creates a self-parented root with the given text', () => {
    expect(createRootNode('My Map')).toEqual({
      id: ROOT_NODE_ID,
      parent: ROOT_NODE_ID,
      text: 'My Map',
    });
  });
});

describe('normalizeNodes', () => {
  it('coerces legacy numeric IDs to strings', () => {
    expect(
      normalizeNodes([
        { id: 0, parent: 0, text: 'root' },
        { id: 1, parent: 0, text: 'child' },
      ]),
    ).toEqual([
      { id: '0', parent: '0', text: 'root' },
      { id: '1', parent: '0', text: 'child' },
    ]);
  });

  it('keeps string IDs as-is and drops extra fields', () => {
    expect(
      normalizeNodes([{ id: 'a', parent: '0', text: 'a', x: 4, fx: null }]),
    ).toEqual([{ id: 'a', parent: '0', text: 'a' }]);
  });

  it('drops malformed entries and non-list input', () => {
    expect(
      normalizeNodes([
        null,
        'nope',
        { id: 'a', parent: '0' },
        { id: true, parent: '0', text: 'x' },
        { id: 'ok', parent: 0, text: 'kept' },
      ]),
    ).toEqual([{ id: 'ok', parent: '0', text: 'kept' }]);
    expect(normalizeNodes(undefined)).toEqual([]);
    expect(normalizeNodes({ id: 'a' })).toEqual([]);
  });

  it('returns fresh objects, not references into the input', () => {
    const input = [{ id: 'a', parent: '0', text: 'a' }];
    const result = normalizeNodes(input);
    expect(result[0]).not.toBe(input[0]);
  });
});

describe('withNodeAdded', () => {
  it('appends the new node', () => {
    const newNode = { id: 'd', parent: 'a', text: 'd' };
    expect(withNodeAdded(tree, newNode)).toEqual([...tree, newNode]);
  });

  it('is a no-op when the ID already exists', () => {
    expect(withNodeAdded(tree, { id: 'a', parent: '0', text: 'dup' })).toEqual(
      tree,
    );
  });

  it('reattaches to the root when the parent no longer exists', () => {
    const added = withNodeAdded(tree, { id: 'd', parent: 'gone', text: 'd' });
    expect(added.find((o) => o.id === 'd')).toEqual({
      id: 'd',
      parent: ROOT_NODE_ID,
      text: 'd',
    });
  });
});

describe('withNodeUpdated', () => {
  it('replaces the matching node', () => {
    const updated = withNodeUpdated(tree, {
      id: 'b',
      parent: 'a',
      text: 'renamed',
    });
    expect(updated.find((o) => o.id === 'b')?.text).toBe('renamed');
    expect(updated.filter((o) => o.id !== 'b')).toEqual(
      tree.filter((o) => o.id !== 'b'),
    );
  });

  it('does not resurrect a concurrently deleted node', () => {
    expect(
      withNodeUpdated(tree, { id: 'gone', parent: 'a', text: 'ghost' }),
    ).toEqual(tree);
  });

  it('strips simulation-only fields from the written node', () => {
    const updated = withNodeUpdated(tree, {
      id: 'b',
      parent: 'a',
      text: 'renamed',
      x: 12,
      fx: 3,
    } as node);
    expect(updated.find((o) => o.id === 'b')).toEqual({
      id: 'b',
      parent: 'a',
      text: 'renamed',
    });
  });
});

describe('withNodeDeleted', () => {
  it('removes the node and reparents direct children one level up', () => {
    const deleted = withNodeDeleted(tree, 'b');
    expect(deleted.find((o) => o.id === 'b')).toBeUndefined();
    // c was b's child; it moves up to b's parent a
    expect(deleted.find((o) => o.id === 'c')?.parent).toBe('a');
  });

  it('leaves grandchildren attached to their own parents', () => {
    const deleted = withNodeDeleted(tree, 'a');
    expect(deleted.find((o) => o.id === 'b')?.parent).toBe(ROOT_NODE_ID);
    expect(deleted.find((o) => o.id === 'c')?.parent).toBe('b');
  });

  it('refuses to delete the root', () => {
    expect(withNodeDeleted(tree, ROOT_NODE_ID)).toEqual(tree);
  });

  it('is a no-op when the node is already gone', () => {
    expect(withNodeDeleted(tree, 'gone')).toEqual(tree);
  });
});
