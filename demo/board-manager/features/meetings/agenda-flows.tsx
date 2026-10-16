import { useDialogs, useToast } from '@local/overlays/react';
import type { AgendaItem, Meeting } from '../../domain/index.js';
import { agendaOf } from '../../domain/index.js';
import {
  createAgendaItem,
  db,
  deleteAgendaItems,
  saveSectionDraft,
  updateAgendaItem,
} from '../../infra/in-memory/index.js';

import type { AgendaRow, SectionDraft } from '../../infra/in-memory/index.js';
import { AgendaItemForm, MinutesForm } from '../../shared/forms.js';
import { confirmAndRun } from '../../shared/lib/flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { membersOf, numbered } from './components/agenda.js';
import { SectionTable } from './components/section-table.js';

export {
  useAddAgendaItemFlow,
  useDeleteAgendaItemsFlow,
  useEditAgendaItemFlow,
  useManageSectionsFlow,
  useRecordMinutesFlow,
};

// The flows of a meeting's agenda, one hook per use case. The agenda table follows the data itself.

const itemOf = (row: AgendaRow): AgendaItem | undefined => db.getState().agendaItems.find((item) => item.id === row.id);

// The people who may present an item: the members of the meeting's board.
const membersOfMeeting = (meeting: Meeting) => membersOf(db.getState(), meeting.boardId);

// The sections of the meeting, in their order.
const sectionsOf = (meeting: Meeting) =>
  db.getState().agendaSections
    .filter((section) => section.meetingId === meeting.id)
    .sort((a, b) => a.position - b.position);

// "Add item": the item form in a dialog, saved before it closes, then a toast.
function useAddAgendaItemFlow(meeting: Meeting): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async () => {
    const result = await dialogs.form({
      title: t('meetings.agenda.newItem'),
      content: (
        <AgendaItemForm
          members={membersOfMeeting(meeting)}
          sections={sectionsOf(meeting)}
          save={(values) => createAgendaItem(meeting.id, values)}
        />
      ),
      buttons: { confirm: t('common.add') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('meetings.agenda.itemAdded'));
  };
}

// "Edit" of an item, in the item form.
function useEditAgendaItemFlow(meeting: Meeting): (item: AgendaRow) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (row) => {
    const result = await dialogs.form({
      title: t('meetings.agenda.editItem'),
      content: (
        <AgendaItemForm
          item={itemOf(row)}
          members={membersOfMeeting(meeting)}
          sections={sectionsOf(meeting)}
          save={(values) => updateAgendaItem(row.id, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('meetings.agenda.itemSaved'));
  };
}

// "Minutes" of an item, in an extra wide dialog: room for the editor's blocks, its side menu and its toolbar.
function useRecordMinutesFlow(meeting: Meeting): (item: AgendaRow) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (row) => {
    const item = itemOf(row);

    if (item === undefined) {
      return;
    }

    const result = await dialogs.form({
      width: 'extraWide',
      // Long minutes are easier to write in the whole window.
      maximizable: true,
      title: numbered(row.number, row.title),
      subtitle: t('meetings.agenda.columns.minutes'),
      content: (
        <MinutesForm
          item={item}
          members={membersOfMeeting(meeting)}
          save={(values) => updateAgendaItem(row.id, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return;
    }

    toasts.success(t('meetings.agenda.minutesSaved'));
  };
}

// "Delete" of items: a critical confirmation that deletes them before it closes, then a toast.
function useDeleteAgendaItemsFlow(): (items: readonly AgendaRow[]) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (rows) => {
    const [first] = rows;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('meetings.agenda.deleteTitle', { count: rows.length }),
        content: t('meetings.agenda.deleteContent', { count: rows.length, name: first?.title ?? '' }),
        buttons: { confirm: t('common.delete') },
      },
      () => deleteAgendaItems(rows.map((row) => row.id)),
    );

    if (!done) {
      return;
    }

    toasts.success(t('meetings.agenda.deleted', { count: rows.length, name: first?.title ?? '' }));
  };
}

// "Manage sections": the sections in a form drawer of their own. Everything in it changes a draft: "Apply" saves it
// at once (the button shows a spinner meanwhile), "Cancel" drops it.
function useManageSectionsFlow(meeting: Meeting): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async () => {
    let draft: SectionDraft = agendaOf(db.getState(), meeting.id).flatMap((entry) =>
      entry.type === 'section' ? [{ id: entry.section.id, title: entry.section.title }] : []
    );
    const drawer = dialogs.form({
      surface: 'drawer',
      title: t('meetings.sections.title'),
      content: (
        <SectionTable
          meetingId={meeting.id}
          initial={draft}
          onChange={(next) => {
            draft = next;
          }}
        />
      ),
      buttons: { confirm: t('meetings.sections.apply') },
    });

    for await (const attempt of drawer) {
      await saveSectionDraft(meeting.id, draft);
      attempt.accept();
    }

    if ((await drawer).canceled) {
      return;
    }

    toasts.success(t('meetings.sections.saved'));
  };
}
