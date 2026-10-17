import { Box, TextInput } from '@mantine/core';
import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import type {
  ColumnEditor,
  RowMove,
  RowSource,
  TableActions,
  TableColumns,
  TableController,
} from '@local/data-table/react';
import { singleRowAction, useDataTableController } from '@local/data-table/react';

import type { AgendaEntry, SectionDraft } from '../../../domain/index.js';
import { agendaNumbers, withSections } from '../../../domain/index.js';
import { translate, useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons, DataTable } from '../../../shared/shared.js';
import { deleteAction, newAction } from '../../../shared/ui/table-actions.js';

export { SectionTable };

// A section in the list of the "Sections" drawer.
type SectionRow = { id: string; title: string; number: string };

// A text in the edit form of a data table (a section's name): Mantine's input, for the column it is in (the form's
// label names it).
function mantineTextEditor<Row>(): ColumnEditor<Row> {
  return ({ columnKey, value, change, labelledBy }) => (
    <TextInput
      size="xs"
      aria-labelledby={labelledBy}
      autoComplete="off"
      value={typeof value === 'string' ? value : ''}
      // A patch of one column: the editor knows its key, not its type.
      onChange={(event) => change({ [columnKey]: event.currentTarget.value } as Partial<Row>)}
    />
  );
}

// The id of a new section (the server keeps it).
const newSectionId = () => `s-${crypto.randomUUID()}`;

// The trimmed name of a section from the edit form; an empty one is refused (the form shows the message).
function sectionTitleOf(draft: SectionRow): string {
  const title = draft.title.trim();

  if (title === '') {
    throw new Error(translate('errors.nameEmpty'));
  }

  return title;
}

function useColumns(): TableColumns<SectionRow> {
  const t = useTranslate();

  return [
    { key: 'number', header: '#', width: '3rem', align: 'end' },
    { key: 'title', header: t('meetings.sections.name'), edit: mantineTextEditor() },
  ];
}

function useActions(
  tableCtrl: TableController<SectionRow>,
  setDraft: Dispatch<SetStateAction<SectionDraft>>,
): TableActions<SectionRow> {
  const t = useTranslate();

  return [
    newAction(t('meetings.sections.add'), () => tableCtrl.addRow({ id: '', title: '', number: '' })),
    singleRowAction('edit', tableCtrl.editRow, { icon: appIcons.edit, tip: t('common.edit'), default: true }),
    singleRowAction('delete', (row) => setDraft((current) => current.filter((section) => section.id !== row.id)), {
      icon: appIcons.remove,
      tip: t('common.delete'),
    }),
    deleteAction((rows) => {
      const ids = new Set(rows.map((row) => row.id));

      setDraft((current) => current.filter((section) => !ids.has(section.id)));
    }, { key: 'delete-selected' }),
  ];
}

// The list of the "Sections" drawer: the draft of the sections (`SectionDraft`) in their order, with their numbers on
// the agenda as it would be with the draft. The names are edited in the data table's edit form: "Edit" (also a
// double click) renames a section, "Add section" opens the form of a new one, which "Save" adds at the end. "Save" of
// the form only changes the draft. "Delete" (of a row, or of the selected ones) and moving a section by its handle
// change the draft at once (no confirmation: "Cancel" of the drawer undoes everything). The list is as wide as the
// drawer and fills its height.
function SectionTable({ meetingId, agenda, initial, onChange }: {
  meetingId: string;
  agenda: readonly AgendaEntry[];
  initial: SectionDraft;
  onChange: (draft: SectionDraft) => void;
}) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<SectionRow>();
  const [draft, setDraft] = useState(initial);
  const columns = useColumns();
  const actions = useActions(tableCtrl, setDraft);
  const first = useRef(true);

  // The rows: the draft with the numbers of the agenda as it would be.
  const source = useMemo((): RowSource<SectionRow> => {
    const numbers = agendaNumbers(withSections(agenda, meetingId, draft));
    const rows = draft.map((section) => ({ ...section, number: numbers.get(section.id) ?? '' }));

    return async () => ({ rows, total: rows.length });
  }, [agenda, draft, meetingId]);

  // A new draft: the owner hears of it, and the list is loaded again (its source is new; the table's effect has taken it
  // over before this one runs), with the new numbers and a new section at its place at the end.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }

    onChange(draft);
    tableCtrl.reload();
  }, [draft, onChange, tableCtrl]);

  // "Save" of the edit form: a rename, or a new section at the end; both only change the draft.
  const saveRow = (row: SectionRow, edited: SectionRow): SectionRow => {
    const title = sectionTitleOf(edited);

    setDraft((current) => current.map((section) => (section.id === row.id ? { ...section, title } : section)));

    return { ...row, title };
  };

  const createRow = (created: SectionRow): SectionRow => {
    const section = { id: newSectionId(), title: sectionTitleOf(created) };

    setDraft((current) => [...current, section]);

    return { ...section, number: '' };
  };

  // A move: right after `after`, or right before `before` (at the top).
  const reorder = (move: RowMove<SectionRow>) => {
    setDraft((current) => {
      const rest = current.filter((section) => section.id !== move.row.id);
      const moved = current.find((section) => section.id === move.row.id);
      const index = move.after !== undefined
        ? rest.findIndex((section) => section.id === move.after?.id) + 1
        : Math.max(0, rest.findIndex((section) => section.id === move.before?.id));

      return moved === undefined ? current : rest.toSpliced(index, 0, moved);
    });
  };

  return (
    // As high as the drawer's body (the screen minus the drawer's header and buttons), so the list scrolls inside it and
    // the drawer never scrolls as a whole.
    <Box h="calc(100dvh - 11rem)">
      <DataTable
        controller={tableCtrl}
        density="compact"
        footer="auto"
        layout="table"
        source={source}
        reorder={reorder}
        saveRow={saveRow}
        createRow={createRow}
        rowKey="id"
        columns={columns}
        actions={actions}
        empty={t('meetings.sections.none')}
        pageSize={100}
        pageSizeOptions={[100]}
      />
    </Box>
  );
}
