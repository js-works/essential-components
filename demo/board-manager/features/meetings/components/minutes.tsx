import { BlockNoteSchema, defaultInlineContentSpecs } from '@blocknote/core';
import { filterSuggestionItems } from '@blocknote/core/extensions';
import { de, en } from '@blocknote/core/locales';
import { BlockNoteView } from '@blocknote/mantine';
import type { Theme } from '@blocknote/mantine';
import {
  BlockNoteContext,
  createReactInlineContentSpec,
  SuggestionMenuController,
  useCreateBlockNote,
} from '@blocknote/react';
import type { DefaultReactSuggestionItem } from '@blocknote/react';
import { Anchor, Input, Text } from '@mantine/core';
import { useRef } from 'react';
import type { ReactElement, ReactNode, Ref } from 'react';
import { Link, useInRouterContext } from 'react-router';
import type { Person } from '../../../domain';
import { getPerson } from '../../../infra/in-memory';
import { useLanguage, useTranslate } from '../../../shared/lib/i18n';
import { useDb, useScheme } from '../../../shared/shared';
import { parseMinutes } from './minutes-format';

export { MinutesEditor, MinutesText };

// The minutes of an agenda item: a BlockNote document, stored as its JSON in `AgendaItem.minutes` (`''` for none). Old
// plain text (the seed) is read as one paragraph per line. A mention (`@` and a member of the board) stores the
// person's id, so it always shows the current name, and "(deleted)" for a person that is gone.

// "@Helena Brandt": the current name of the person. A link to the member's page where it is read inside the router and
// not edited (the minutes tab, an item's detail row); in the editor (a dialog, outside the router) plain text.
const Mention = createReactInlineContentSpec(
  { type: 'mention', propSchema: { personId: { default: '' } }, content: 'none' },
  {
    render: ({ inlineContent, editor }) => (
      <MentionView personId={inlineContent.props.personId} link={!editor.isEditable} />
    ),
  },
);

function MentionView({ personId, link }: { personId: string; link: boolean }): ReactElement {
  const name = useDb((state) => getPerson(state, personId)?.name);
  const inRouter = useInRouterContext();
  const t = useTranslate();
  const text = `@${name ?? t('meetings.minutesView.deleted')}`;

  // In the size of the text around it (Mantine's `Text` and `Anchor` would be `md`), in Mantine's accent color, like the
  // filled buttons (`.board-manager__mention`).
  return link && inRouter && name !== undefined
    ? (
      <Anchor component={Link} to={`/members/${personId}`} fz="inherit" fw={500} className="board-manager__mention">
        {text}
      </Anchor>
    )
    : (
      <Text
        component="span"
        fz="inherit"
        fw={500}
        className={name === undefined ? undefined : 'board-manager__mention'}
        c={name === undefined ? 'dimmed' : undefined}
      >
        {text}
      </Text>
    );
}

// BlockNote in Mantine's look: its own colors, radius and font (the `--bn-*` variables of `@blocknote/mantine`, which
// style its Mantine menus like BlockNote) set to Mantine's variables. One theme for both schemes (the variables follow
// the scope's scheme); BlockNote's highlight colors stay its own.
const MANTINE_LOOK: Theme = {
  colors: {
    editor: { text: 'var(--mantine-color-text)', background: 'var(--mantine-color-body)' },
    menu: { text: 'var(--mantine-color-text)', background: 'var(--mantine-color-body)' },
    tooltip: { text: 'var(--mantine-color-text)', background: 'var(--mantine-color-default-hover)' },
    hovered: { text: 'var(--mantine-color-text)', background: 'var(--mantine-color-default-hover)' },
    selected: { text: 'var(--mantine-primary-color-contrast)', background: 'var(--mantine-primary-color-filled)' },
    disabled: { text: 'var(--mantine-color-dimmed)', background: 'var(--mantine-color-default-hover)' },
    shadow: 'var(--mantine-shadow-md)',
    border: 'var(--mantine-color-default-border)',
    sideMenu: 'var(--mantine-color-dimmed)',
  },
  // Mantine's `sm` (the app's `defaultRadius`).
  borderRadius: 4,
  fontFamily: 'var(--mantine-font-family)',
};

// With a theme object, BlockNote takes the scheme from its context (else from the system): the app's.
function SchemeContext({ children }: { children: ReactNode }): ReactElement {
  return (
    <BlockNoteContext.Provider value={{ colorSchemePreference: useScheme() }}>{children}</BlockNoteContext.Provider>
  );
}

const schema = BlockNoteSchema.create({ inlineContentSpecs: { ...defaultInlineContentSpecs, mention: Mention } });

type MinutesBlock = typeof schema.PartialBlock;

// BlockNote's own texts (its menus, placeholders, tooltips) in the app's language: English or German. The editor takes
// them when it is created, so it is created again when the language changes (see the editors below).
const dictionaryOf = (language: string) => (language.startsWith('de') ? de : en);

// The stored minutes as blocks (`minutes-format.ts`); `undefined` for none (an empty editor).
function toBlocks(minutes: string): MinutesBlock[] | undefined {
  return parseMinutes(minutes) as MinutesBlock[] | undefined;
}

// The blocks as they are stored: `''` while every block is an empty paragraph.
function toMinutes(blocks: readonly unknown[]): string {
  const empty = blocks.every((block) => {
    const { type, content, children } = block as { type?: string; content?: unknown; children?: unknown[] };

    return type === 'paragraph' && Array.isArray(content) && content.length === 0 && (children?.length ?? 0) === 0;
  });

  return empty ? '' : JSON.stringify(blocks);
}

// The editor of the minutes dialog, a field of a form (form-validation's contract: a label and an error prop,
// `defaultValue`, `onChange` with the value), in Mantine's input wrapper. Its value is the minutes (`toMinutes`). `@`
// opens a menu of `people` (the board's members), filtered by what follows.
function MinutesEditor({ label, description, error, defaultValue = '', onChange, onBlur, ref, people }: {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLDivElement>;
  people: readonly Person[];
}): ReactElement {
  const language = useLanguage();
  // The value as it is now: a new editor (another language) starts with it, nothing typed is lost.
  const valueRef = useRef(defaultValue);
  const editor = useCreateBlockNote(
    { schema, dictionary: dictionaryOf(language), initialContent: toBlocks(valueRef.current) },
    [language],
  );

  const mentionItems = (query: string): DefaultReactSuggestionItem[] =>
    filterSuggestionItems(
      people.map((person) => ({
        title: person.name,
        onItemClick: () => editor.insertInlineContent([{ type: 'mention', props: { personId: person.id } }, ' ']),
      })),
      query,
    );

  return (
    <Input.Wrapper label={label} description={description} error={error}>
      <div ref={ref} className="board-manager__minutes-editor" onBlur={onBlur}>
        <SchemeContext>
          <BlockNoteView
            editor={editor}
            theme={MANTINE_LOOK}
            onChange={() => {
              valueRef.current = toMinutes(editor.document);
              onChange?.(valueRef.current);
            }}
          >
            <SuggestionMenuController triggerCharacter="@" getItems={async (query) => mentionItems(query)} />
          </BlockNoteView>
        </SchemeContext>
      </div>
    </Input.Wrapper>
  );
}

// The minutes, read-only (the minutes tab, an item's detail row); `empty` when there are none.
function MinutesText({ minutes, empty }: { minutes: string; empty: string }): ReactElement {
  const blocks = toBlocks(minutes);

  return blocks === undefined
    ? <Text size="sm" c="dimmed">{empty}</Text>
    : <MinutesDocument key={minutes} blocks={blocks} />;
}

function MinutesDocument({ blocks }: { blocks: MinutesBlock[] }): ReactElement {
  const language = useLanguage();
  const editor = useCreateBlockNote({ schema, dictionary: dictionaryOf(language), initialContent: blocks }, [language]);

  return (
    <div className="board-manager__minutes-text">
      <SchemeContext>
        <BlockNoteView editor={editor} theme={MANTINE_LOOK} editable={false} />
      </SchemeContext>
    </div>
  );
}
