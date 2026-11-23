import type { PartialBlock } from '@blocknote/core';

import type { RichTextFormat } from './api/props.js';
import type { RichTextSchema } from './schema.js';
import { converterOf } from './schema.js';

export { blocksOf, valueOf };

type Blocks = PartialBlock[];

// The blocks of a value in a format; `undefined` for an empty one. BlockNote's JSON, or plain text (one paragraph per
// line: data from before an editor); HTML and Markdown through BlockNote's converters (lossy).
function blocksOf(value: string, format: RichTextFormat, schema: RichTextSchema): Blocks | undefined {
  if (value.trim() === '') {
    return undefined;
  }

  if (format === 'html') {
    return converterOf(schema).tryParseHTMLToBlocks(value) as Blocks;
  }

  if (format === 'markdown') {
    return converterOf(schema).tryParseMarkdownToBlocks(value) as Blocks;
  }

  if (value.startsWith('[')) {
    try {
      return JSON.parse(value) as Blocks;
    } catch {
      // Plain text that starts with a bracket.
    }
  }

  return value.split('\n').map((line) => ({ type: 'paragraph', content: line }));
}

// The value of a document in a format: `''` while every block is an empty paragraph.
function valueOf(blocks: readonly unknown[], format: RichTextFormat, schema: RichTextSchema): string {
  const empty = blocks.every((block) => {
    const { type, content, children } = block as { type?: string; content?: unknown; children?: unknown[] };

    return type === 'paragraph' && Array.isArray(content) && content.length === 0 && (children?.length ?? 0) === 0;
  });

  if (empty) {
    return '';
  }

  return format === 'html'
    ? converterOf(schema).blocksToHTMLLossy(blocks as Blocks)
    : format === 'markdown'
    ? converterOf(schema).blocksToMarkdownLossy(blocks as Blocks)
    : JSON.stringify(blocks);
}
