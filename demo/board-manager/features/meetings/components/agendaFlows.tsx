import type { AgendaItem, Meeting } from '../../../domain/index.js';
import { agendaOf } from '../../../domain/index.js';
import {
  createAgendaItem,
  db,
  deleteAgendaItems,
  saveSectionDraft,
  updateAgendaItem,
} from '../../../infra/in-memory/index.js';
import type { AgendaRow, SectionDraft } from '../../../infra/in-memory/index.js';
import { AgendaItemForm, MinutesForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import type { TableContext } from '../../../shared/lib/flows.js';
import { translate } from '../../../shared/lib/i18n/index.js';
import { membersOf, numbered } from './agenda.js';
import { SectionTable } from './SectionTable.js';

export { createAgendaItemFlow, deleteAgendaItemsFlow, editAgendaItemFlow, manageSectionsFlow, recordMinutesFlow };
export type { AgendaContext };

// What the flows of a meeting's agenda need: the table's context and the meeting.
type AgendaContext = TableContext<AgendaRow> & { meeting: Meeting };

const itemOf = (row: AgendaRow): AgendaItem | undefined => db.getState().agendaItems.find((item) => item.id === row.id);

// The people who may present an item: the members of the meeting's board.
const membersOfMeeting = (meeting: Meeting) => membersOf(db.getState(), meeting.boardId);

// The sections of the meeting, in their order.
const sectionsOf = (meeting: Meeting) =>
  db.getState().agendaSections
    .filter((section) => section.meetingId === meeting.id)
    .sort((a, b) => a.position - b.position);

// "Add item": the item form in a dialog, saved before it closes; then the table reloads and a toast says so.
async function createAgendaItemFlow({ dialogs, toasts, nav, meeting }: AgendaContext): Promise<void> {
  const saved = !(await dialogs.form({
    title: translate('meetings.agenda.newItem'),
    content: (
      <AgendaItemForm
        members={membersOfMeeting(meeting)}
        sections={sectionsOf(meeting)}
        save={(values) => createAgendaItem(meeting.id, values)}
      />
    ),
    buttons: { confirm: translate('common.add') },
  })).canceled;

  if (saved) {
    nav.reload();
    toasts.success(translate('meetings.agenda.itemAdded'));
  }
}

// "Edit" of an item, in the item form.
async function editAgendaItemFlow({ dialogs, toasts, nav, meeting }: AgendaContext, row: AgendaRow): Promise<void> {
  const saved = !(await dialogs.form({
    title: translate('meetings.agenda.editItem'),
    content: (
      <AgendaItemForm
        item={itemOf(row)}
        members={membersOfMeeting(meeting)}
        sections={sectionsOf(meeting)}
        save={(values) => updateAgendaItem(row.id, values)}
      />
    ),
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    nav.reload();
    toasts.success(translate('meetings.agenda.itemSaved'));
  }
}

// "Minutes" of an item, in an extra wide dialog: room for the editor's blocks, its side menu and its toolbar.
async function recordMinutesFlow({ dialogs, toasts, nav, meeting }: AgendaContext, row: AgendaRow): Promise<void> {
  const item = itemOf(row);

  if (item === undefined) {
    return;
  }

  const saved = !(await dialogs.form({
    width: 'extraWide',
    // Long minutes are easier to write in the whole window.
    maximizable: true,
    title: numbered(row.number, row.title),
    subtitle: translate('meetings.agenda.columns.minutes'),
    content: (
      <MinutesForm
        item={item}
        members={membersOfMeeting(meeting)}
        save={(values) => updateAgendaItem(row.id, values)}
      />
    ),
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    nav.reload();
    toasts.success(translate('meetings.agenda.minutesSaved'));
  }
}

// "Delete" of items: a critical confirmation that deletes them before it closes.
async function deleteAgendaItemsFlow({ dialogs, toasts, nav }: AgendaContext, rows: readonly AgendaRow[]) {
  const [first] = rows;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('meetings.agenda.deleteTitle', { count: rows.length }),
      content: translate('meetings.agenda.deleteContent', { count: rows.length, name: first?.title ?? '' }),
      buttons: { confirm: translate('common.delete') },
    },
    () => deleteAgendaItems(rows.map((row) => row.id)),
  );

  if (done) {
    nav.reload();
    toasts.success(translate('meetings.agenda.deleted', { count: rows.length, name: first?.title ?? '' }));
  }
}

// "Manage sections": the sections in a form drawer of their own. Everything in it changes a draft: "Apply" saves it
// at once (the button shows a spinner meanwhile), "Cancel" drops it.
async function manageSectionsFlow({ dialogs, toasts, nav, meeting }: AgendaContext): Promise<void> {
  let draft: SectionDraft = agendaOf(db.getState(), meeting.id).flatMap((entry) =>
    entry.type === 'section' ? [{ id: entry.section.id, title: entry.section.title }] : []
  );
  const drawer = dialogs.form({
    surface: 'drawer',
    title: translate('meetings.sections.title'),
    content: (
      <SectionTable
        meetingId={meeting.id}
        initial={draft}
        onChange={(next) => {
          draft = next;
        }}
      />
    ),
    buttons: { confirm: translate('meetings.sections.apply') },
  });

  for await (const attempt of drawer) {
    await saveSectionDraft(meeting.id, draft);
    attempt.accept();
  }

  if ((await drawer).canceled) {
    return;
  }

  nav.reload();
  toasts.success(translate('meetings.sections.saved'));
}
