import { Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';
import type { ReactNode, Ref } from 'react';

import type { RichTextMentions } from '@local/rich-text';
import { RichText, RichTextEditor } from '@local/rich-text';

import type { Person } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { usePersonList } from '../../members/reads.js';

export { MinutesEditor, MinutesText };

// The minutes of an agenda item: a rich text (`@local/rich-text`), stored as BlockNote's JSON in `AgendaItem.minutes`
// (`''` for none; old plain text, the seed, is read as one paragraph per line). A mention (`@` and a member of the
// board) stores the person's id, so it always shows the current name, and "(deleted)" for a person that is gone.

// The current name of a mentioned person, or "(deleted)".
function useLabelOf(): (id: string) => string {
  const people = usePersonList();
  const t = useTranslate();

  return (id) => people.find((person) => person.id === id)?.name ?? t('meetings.minutesView.deleted');
}

// The editor of the minutes dialog, a field of a form (form-validation's contract: a label and an error prop,
// `defaultValue`, `onChange` with the value). `@` opens a menu of `people` (the board's members), filtered by what
// follows. The dialog is outside the router: the mentions are no links here.
function MinutesEditor({ label, description, error, defaultValue = '', onChange, onBlur, ref, people }: {
  label?: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  ref?: Ref<HTMLDivElement>;
  people: readonly Person[];
}) {
  const labelOf = useLabelOf();
  const mentions: RichTextMentions = {
    suggest: (query) =>
      people
        .filter((person) => person.name.toLowerCase().includes(query.toLowerCase()))
        .map((person) => ({ id: person.id, label: person.name })),
    labelOf,
  };

  return (
    <div ref={ref} className="board-manager__minutes-editor">
      <RichTextEditor
        label={label}
        description={description}
        error={error}
        defaultValue={defaultValue}
        onChange={onChange}
        onBlur={onBlur}
        mentions={mentions}
        minRows={8}
      />
    </div>
  );
}

// The minutes, read-only (the minutes tab, an item's detail row; inside the router: a mention links to the member's
// page); `empty` when there are none.
function MinutesText({ minutes, empty }: { minutes: string; empty: string }) {
  const labelOf = useLabelOf();
  const navigate = useNavigate();

  return minutes.trim() === ''
    ? <Text size="sm" c="dimmed">{empty}</Text>
    : (
      <RichText
        value={minutes}
        mentions={{
          labelOf,
          hrefOf: (id) => `/members/${id}`,
          onOpen: (id) => void navigate({ to: '/members/$personId', params: { personId: id } }),
        }}
      />
    );
}
