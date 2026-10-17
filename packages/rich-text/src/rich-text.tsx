import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import type { ReactElement } from 'react';

import type { RichTextProps } from './api/props.js';
import { blocksOf } from './format.js';
import { dictionaryOf, useDocumentLanguage } from './language.js';
import { MANTINE_LOOK, SchemeContext } from './look.js';
import { MentionsContext, schemaOf } from './schema.js';

export { RichText };

// A rich text, read-only (in a table, a detail view): like text, in Mantine's font and size, without the editor's
// frame; mentions as links where the app gives them (`mentions.hrefOf`). Nothing for an empty value.
function RichText({ value, format = 'blocknote', mentions, className }: RichTextProps): ReactElement | null {
  const blocks = blocksOf(value, format, schemaOf(true));

  return blocks === undefined
    ? null
    : <Document key={`${format}:${value}`} value={value} format={format} mentions={mentions} className={className} />;
}

function Document({ value, format = 'blocknote', mentions, className }: RichTextProps): ReactElement {
  const language = useDocumentLanguage();
  const schema = schemaOf(true);
  const editor = useCreateBlockNote(
    { schema, dictionary: dictionaryOf(language, undefined), initialContent: blocksOf(value, format, schema) },
    [language],
  );

  return (
    <div className={className === undefined ? 'rich-text' : `rich-text ${className}`}>
      <MentionsContext.Provider value={mentions}>
        <SchemeContext>
          <BlockNoteView editor={editor} theme={MANTINE_LOOK} editable={false} />
        </SchemeContext>
      </MentionsContext.Provider>
    </div>
  );
}
