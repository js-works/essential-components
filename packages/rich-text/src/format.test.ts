import { describe, expect, it } from 'vitest';

import { blocksOf, valueOf } from './format.js';
import { schemaOf } from './schema.js';

const schema = schemaOf(false);

describe('blocksOf', () => {
  it('gives none for an empty value, in every format', () => {
    expect(blocksOf('  ', 'blocknote', schema)).toBeUndefined();
    expect(blocksOf('', 'html', schema)).toBeUndefined();
    expect(blocksOf('', 'markdown', schema)).toBeUndefined();
  });

  it('reads BlockNote\'s JSON, and plain text as one paragraph per line', () => {
    const json = JSON.stringify([{ type: 'paragraph', content: 'Hello' }]);

    expect(blocksOf(json, 'blocknote', schema)).toEqual([{ type: 'paragraph', content: 'Hello' }]);
    expect(blocksOf('One\nTwo', 'blocknote', schema)).toEqual([
      { type: 'paragraph', content: 'One' },
      { type: 'paragraph', content: 'Two' },
    ]);
    expect(blocksOf('[not json', 'blocknote', schema)).toEqual([{ type: 'paragraph', content: '[not json' }]);
  });

  it('reads HTML and Markdown through BlockNote', () => {
    const fromHtml = blocksOf('<h1>Title</h1><p>Text</p>', 'html', schema) as { type: string }[];
    const fromMarkdown = blocksOf('# Title\n\n- one\n- two', 'markdown', schema) as { type: string }[];

    expect(fromHtml.map((block) => block.type)).toEqual(['heading', 'paragraph']);
    expect(fromMarkdown.map((block) => block.type)).toEqual(['heading', 'bulletListItem', 'bulletListItem']);
  });
});

describe('valueOf', () => {
  it('gives \'\' for a document of empty paragraphs', () => {
    expect(valueOf([{ type: 'paragraph', content: [], children: [] }], 'blocknote', schema)).toBe('');
  });

  it('writes BlockNote\'s JSON, HTML and Markdown', () => {
    const blocks = blocksOf('# Title\n\nText', 'markdown', schema)!;

    expect(JSON.parse(valueOf(blocks, 'blocknote', schema))).toHaveLength(2);
    expect(valueOf(blocks, 'html', schema)).toContain('<h1>Title</h1>');
    expect(valueOf(blocks, 'markdown', schema)).toContain('# Title');
  });
});
