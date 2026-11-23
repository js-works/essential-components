import { BlockNoteEditor, BlockNoteSchema, defaultBlockSpecs, defaultInlineContentSpecs } from '@blocknote/core';
import { createReactInlineContentSpec } from '@blocknote/react';
import { Anchor, Text } from '@mantine/core';
import type { MouseEvent } from 'react';
import { createContext, useContext } from 'react';

import type { RichTextMentions } from './api/props.js';

export type { RichTextSchema };
export { converterOf, MentionsContext, schemaOf };

// What a mention shows: the label and the link the app gives for its id (`mentions` of the components).
const MentionsContext = createContext<Pick<RichTextMentions, 'labelOf' | 'hrefOf' | 'onOpen'> | undefined>(undefined);

// "@Helena Brandt": the current label of the id (the app's `labelOf`, also for one that is gone). A link where the
// text is read, not edited, and the app gives one (`hrefOf`); `onOpen` takes the click (e.g. the app's router).
function MentionView({ id, editable }: { id: string; editable: boolean }) {
  const mentions = useContext(MentionsContext);
  const text = `@${mentions?.labelOf(id) ?? id}`;
  const href = editable ? undefined : mentions?.hrefOf?.(id);
  const open = mentions?.onOpen;
  const click = (event: MouseEvent) => {
    if (open !== undefined && !event.metaKey && !event.ctrlKey && !event.shiftKey) {
      event.preventDefault();
      open(id);
    }
  };

  return href === undefined
    ? <Text component="span" fz="inherit" fw={500} className="rich-text__mention">{text}</Text>
    : <Anchor href={href} onClick={click} fz="inherit" fw={500} className="rich-text__mention">{text}</Anchor>;
}

// A mention: an inline content of its own, storing only the id (so it always shows the current label). In HTML a span
// with the id and the label (`data-mention-id`).
const Mention = createReactInlineContentSpec(
  { type: 'mention', propSchema: { id: { default: '' } }, content: 'none' },
  {
    render: ({ inlineContent, editor }) => <MentionView id={inlineContent.props.id} editable={editor.isEditable} />,
    toExternalHTML: ({ inlineContent }) => <MentionHtml id={inlineContent.props.id} />,
  },
);

function MentionHtml({ id }: { id: string }) {
  const mentions = useContext(MentionsContext);

  return <span data-mention-id={id}>@{mentions?.labelOf(id) ?? id}</span>;
}

// The text blocks; the media blocks (image, video, audio, file) only where the app uploads files (`uploadFile`).
const { audio, file, image, video, ...textBlocks } = defaultBlockSpecs;

const schemas = {
  text: BlockNoteSchema.create({
    blockSpecs: textBlocks,
    inlineContentSpecs: { ...defaultInlineContentSpecs, mention: Mention },
  }),
  media: BlockNoteSchema.create({
    blockSpecs: { ...textBlocks, audio, file, image, video },
    inlineContentSpecs: { ...defaultInlineContentSpecs, mention: Mention },
  }),
};

// The type of both: the text schema is the media one without the media blocks.
type RichTextSchema = (typeof schemas)['media'];

function schemaOf(withMedia: boolean): RichTextSchema {
  return withMedia ? schemas.media : (schemas.text as unknown as RichTextSchema);
}

// An editor without a view, per schema, for converting HTML and Markdown to blocks and back (made on first use).
const converters = new Map<RichTextSchema, BlockNoteEditor>();

function converterOf(schema: RichTextSchema): BlockNoteEditor {
  let converter = converters.get(schema);

  if (converter === undefined) {
    converter = BlockNoteEditor.create({ schema }) as unknown as BlockNoteEditor;
    converters.set(schema, converter);
  }

  return converter;
}
