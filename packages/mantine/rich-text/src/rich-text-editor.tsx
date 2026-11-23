import { filterSuggestionItems } from '@blocknote/core/extensions';
import { BlockNoteView } from '@blocknote/mantine';
import { getDefaultReactSlashMenuItems, SuggestionMenuController, useCreateBlockNote } from '@blocknote/react';
import { Input } from '@mantine/core';
import type { CSSProperties, ReactElement } from 'react';
import { useEffect, useRef } from 'react';

import type { RichTextEditorProps } from './api/props.js';
import { blocksOf, valueOf } from './format.js';
import { dictionaryOf, useDocumentLanguage } from './language.js';
import { MANTINE_LOOK, SchemeContext } from './look.js';
import { MentionsContext, schemaOf } from './schema.js';

export { RichTextEditor };

// The height of a row of text (BlockNote's line height), for `minRows` and `maxRows`.
const ROW = '1.5em';

// A rich-text field (BlockNote) like Mantine's inputs: Mantine's input wrapper (label, description, error) around a
// Mantine input (its border, focus, error, size, radius, variant, disabled). Its value is a string in `format`. `@`
// opens the app's mentions (`mentions.suggest`), `/` the blocks: the text blocks, the media ones with `uploadFile`.
function RichTextEditor(props: RichTextEditorProps): ReactElement {
  const {
    value,
    defaultValue = '',
    onChange,
    onBlur,
    format = 'blocknote',
    mentions,
    uploadFile,
    placeholder,
    size,
    radius,
    variant,
    disabled = false,
    readOnly = false,
    autosize = true,
    minRows = 4,
    maxRows,
    error,
    ...wrapperProps
  } = props;
  const language = useDocumentLanguage();
  const schema = schemaOf(uploadFile !== undefined);
  // The value as it is now: a new editor (another language) starts with it, nothing typed is lost.
  const valueRef = useRef(value ?? defaultValue);
  const editor = useCreateBlockNote(
    {
      schema,
      dictionary: dictionaryOf(language, placeholder),
      initialContent: blocksOf(valueRef.current, format, schema),
      uploadFile,
    },
    [language, placeholder, schema],
  );

  // Controlled: a new value from outside (not the one this editor gave) replaces the document.
  useEffect(() => {
    if (value === undefined || value === valueRef.current) {
      return;
    }

    valueRef.current = value;
    editor.replaceBlocks(editor.document, blocksOf(value, format, schema) ?? [{ type: 'paragraph' }]);
  }, [editor, value, format, schema]);

  const height: CSSProperties = autosize
    ? {
      minHeight: `calc(${minRows} * ${ROW})`,
      maxHeight: maxRows === undefined ? undefined : `calc(${maxRows} * ${ROW})`,
    }
    : { height: `calc(${minRows} * ${ROW})` };

  return (
    <Input.Wrapper {...wrapperProps} error={error} size={size}>
      <Input
        component="div"
        multiline
        size={size}
        radius={radius}
        variant={variant}
        disabled={disabled}
        error={error !== undefined && error !== false && error !== null}
        className="rich-text__input"
        data-read-only={readOnly || undefined}
        onBlur={onBlur}
      >
        <div className="rich-text__scroller" style={height}>
          <MentionsContext.Provider value={mentions}>
            <SchemeContext>
              <BlockNoteView
                editor={editor}
                theme={MANTINE_LOOK}
                editable={!disabled && !readOnly}
                emojiPicker={false}
                slashMenu={false}
                onChange={() => {
                  valueRef.current = valueOf(editor.document, format, schema);
                  onChange?.(valueRef.current);
                }}
              >
                <SuggestionMenuController
                  triggerCharacter="/"
                  getItems={async (query) =>
                    filterSuggestionItems(
                      getDefaultReactSlashMenuItems(editor).filter((item) =>
                        (item as { key?: string }).key !== 'emoji'
                      ),
                      query,
                    )}
                />
                {mentions === undefined ? null : (
                  <SuggestionMenuController
                    triggerCharacter="@"
                    getItems={async (query) =>
                      (await mentions.suggest(query)).map((option) => ({
                        title: option.label,
                        onItemClick: () =>
                          editor.insertInlineContent([{ type: 'mention', props: { id: option.id } }, ' ']),
                      }))}
                  />
                )}
              </BlockNoteView>
            </SchemeContext>
          </MentionsContext.Provider>
        </div>
      </Input>
    </Input.Wrapper>
  );
}
