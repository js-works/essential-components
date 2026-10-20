import type { AgendaItem, Meeting, SectionDraft } from '../../domain/index.js';
import { AgendaItemForm, MinutesForm } from '../../shared/forms.js';
import { useFlowKit } from '../../shared/lib/flows.js';
import type { AgendaRow } from './agenda.js';
import { numbered } from './agenda.js';
import { useAgenda, useBoardMembers, useMeetingService } from './meeting-data.js';
import { SectionTable } from './section-table.js';

export {
  useAddAgendaItemFlow,
  useDeleteAgendaItemsFlow,
  useEditAgendaItemFlow,
  useManageSectionsFlow,
  useRecordMinutesFlow,
};

// The flows of a meeting's agenda, one hook per use case. A flow changes the data through the service (which says
// so: every read loads again); it knows no table. The presenters are the members of the meeting's board; the sections
// are the agenda's, in their order.

// The item of a row as it is stored (without the row's own fields).
function itemOf({ number: _, presenter: __, recorded: ___, ...item }: AgendaRow): AgendaItem {
  return item;
}

// "Add item": the item form in a dialog, saved before it closes, then a toast.
function useAddAgendaItemFlow(meeting: Meeting): () => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useMeetingService();
  const members = useBoardMembers(meeting.boardId);
  const { sections } = useAgenda(meeting.id);

  return () =>
    formFlow({
      title: t('meetings.agenda.newItem'),
      content: (
        <AgendaItemForm
          members={members}
          sections={sections}
          save={(values) => service.createItem(meeting.id, values)}
        />
      ),
      buttons: { confirm: t('common.add') },
      success: t('meetings.agenda.itemAdded'),
    });
}

// "Edit" of an item, in the item form.
function useEditAgendaItemFlow(meeting: Meeting): (item: AgendaRow) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useMeetingService();
  const members = useBoardMembers(meeting.boardId);
  const { sections } = useAgenda(meeting.id);

  return (row) =>
    formFlow({
      title: t('meetings.agenda.editItem'),
      content: (
        <AgendaItemForm
          item={itemOf(row)}
          members={members}
          sections={sections}
          save={(values) => service.updateItem(row.id, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
      success: t('meetings.agenda.itemSaved'),
    });
}

// "Minutes" of an item, in an extra wide dialog: room for the editor's blocks, its side menu and its toolbar.
function useRecordMinutesFlow(meeting: Meeting): (item: AgendaRow) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useMeetingService();
  const members = useBoardMembers(meeting.boardId);

  return (row) =>
    formFlow({
      width: 'extraWide',
      // Long minutes are easier to write in the whole window.
      maximizable: true,
      title: numbered(row.number, row.title),
      subtitle: t('meetings.agenda.columns.minutes'),
      content: (
        <MinutesForm
          item={itemOf(row)}
          members={members}
          save={(values) => service.updateItem(row.id, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
      success: t('meetings.agenda.minutesSaved'),
    });
}

// "Delete" of items: a critical confirmation that deletes them before it closes, then a toast.
function useDeleteAgendaItemsFlow(): (items: readonly AgendaRow[]) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useMeetingService();

  return (rows) => {
    const count = rows.length;
    const name = rows[0]?.title ?? '';

    return confirmFlow({
      critical: true,
      title: t('meetings.agenda.deleteTitle', { count }),
      content: t('meetings.agenda.deleteContent', { count, name }),
      buttons: { confirm: t('common.delete') },
      run: () => service.deleteItems(rows.map((row) => row.id)),
      success: t('meetings.agenda.deleted', { count, name }),
    });
  };
}

// "Manage sections": the sections in a form drawer of their own. Everything in it changes a draft: "Apply" saves it
// at once (the button shows a spinner meanwhile), "Cancel" drops it.
function useManageSectionsFlow(meeting: Meeting): () => Promise<void> {
  const { dialogs, toasts, t } = useFlowKit();
  const service = useMeetingService();
  const { entries, sections } = useAgenda(meeting.id);

  return async () => {
    let draft: SectionDraft = sections.map((section) => ({ id: section.id, title: section.title }));
    const drawer = dialogs.form({
      surface: 'drawer',
      title: t('meetings.sections.title'),
      content: (
        <SectionTable
          meetingId={meeting.id}
          agenda={entries}
          initial={draft}
          onChange={(next) => {
            draft = next;
          }}
        />
      ),
      buttons: { confirm: t('meetings.sections.apply') },
    });

    for await (const attempt of drawer) {
      await service.saveSections(meeting.id, draft);
      attempt.accept();
    }

    if ((await drawer).canceled) {
      return;
    }

    toasts.success(t('meetings.sections.saved'));
  };
}
