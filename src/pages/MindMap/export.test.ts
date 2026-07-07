import { describe, expect, it } from 'vitest';
import { mindMapToMarkdown, sanitizeFilename } from './export';
import { ROOT_NODE_ID } from '../../nodeOps';
import { node } from '../../types';

const tree: node[] = [
  { id: ROOT_NODE_ID, parent: ROOT_NODE_ID, text: 'root' },
  { id: 'a', parent: ROOT_NODE_ID, text: 'idea a' },
  { id: 'b', parent: 'a', text: 'idea b' },
  { id: 'c', parent: 'a', text: 'idea c' },
  { id: 'd', parent: ROOT_NODE_ID, text: 'idea d' },
];

describe('mindMapToMarkdown', () => {
  it('reproduces the tree as an indented outline under a title heading', () => {
    expect(mindMapToMarkdown(tree, 'My Map')).toBe(
      [
        '# My Map',
        '',
        '- root',
        '  - idea a',
        '    - idea b',
        '    - idea c',
        '  - idea d',
        '',
      ].join('\n'),
    );
  });

  it('flattens newlines inside node text so items stay single lines', () => {
    const md = mindMapToMarkdown(
      [{ id: ROOT_NODE_ID, parent: ROOT_NODE_ID, text: 'two\nlines' }],
      't',
    );
    expect(md).toContain('- two lines');
  });

  it('emits nodes unreachable from the root instead of dropping them', () => {
    const md = mindMapToMarkdown(
      [
        { id: ROOT_NODE_ID, parent: ROOT_NODE_ID, text: 'root' },
        { id: 'x', parent: 'gone', text: 'orphan' },
        { id: 'y', parent: 'x', text: 'orphan child' },
      ],
      't',
    );
    expect(md).toContain('- orphan');
    expect(md).toContain('  - orphan child');
  });

  it('terminates on cyclic parent references', () => {
    const md = mindMapToMarkdown(
      [
        { id: ROOT_NODE_ID, parent: ROOT_NODE_ID, text: 'root' },
        { id: 'x', parent: 'y', text: 'x' },
        { id: 'y', parent: 'x', text: 'y' },
      ],
      't',
    );
    expect(md).toContain('- x');
    expect(md).toContain('- y');
  });

  it('handles a rootless node list', () => {
    expect(mindMapToMarkdown([], 'empty')).toBe('# empty\n\n');
  });
});

describe('sanitizeFilename', () => {
  it('strips path separators and reserved characters', () => {
    expect(sanitizeFilename('my/map: "v2" <final>?')).toBe('mymap v2 final');
  });

  it('falls back when nothing survives', () => {
    expect(sanitizeFilename('///')).toBe('mindmap');
    expect(sanitizeFilename('')).toBe('mindmap');
  });
});
