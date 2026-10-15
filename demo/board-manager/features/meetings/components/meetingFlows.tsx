import type { NavigateFunction } from 'react-router';
import {
  boardIdsOf,
  createMeeting,
  db,
  deleteMeetings,
  getMeeting,
  setMeetingStatus,
  updateMeeting,
} from '../../../infra/in-memory/index.js';
import type { MeetingRow } from '../../../infra/in-memory/index.js';
import { MeetingForm } from '../../../shared/forms.js';
import { confirmAndRun } from '../../../shared/lib/flows.js';
import type { Dialogs, TableContext, Toasts } from '../../../shared/lib/flows.js';
import { translate } from '../../../shared/lib/i18n/index.js';
import { formatDateTime } from '../../../shared/shared.js';

export { cancelMeetingFlow, createMeetingFlow, deleteMeetingsFlow, editMeeting };
export type { MeetingListContext };

// What the flows of a meetings list need: the table's context, the board or the person of the list (none: all
// boards), and where a meeting opens.
type MeetingListContext = TableContext<MeetingRow> & {
  navigate: NavigateFunction;
  boardId?: string;
  personId?: string;
  pathOf: (meeting: { id: string; boardId: string }) => string;
};

// "New meeting": the meeting form in a dialog (with the board to choose, of the person's boards with a person, when
// the list has no board), saved before it closes; then a toast, and the new meeting's page.
async function createMeetingFlow({ dialogs, toasts, navigate, boardId, personId, pathOf }: MeetingListContext) {
  const state = db.getState();
  const boardIds = personId === undefined ? undefined : boardIdsOf(state, personId);
  const choices = state.boards.filter((board) => boardIds === undefined || boardIds.includes(board.id));
  let created: { id: string; boardId: string } | undefined;
  const saved = !(await dialogs.form({
    title: translate('meetings.new'),
    content: (
      <MeetingForm
        boards={boardId === undefined ? choices : undefined}
        save={async (values) => {
          created = await createMeeting(boardId ?? values.boardId ?? '', values);
        }}
      />
    ),
    buttons: { confirm: translate('common.create') },
  })).canceled;

  if (saved && created !== undefined) {
    toasts.success(translate('meetings.created'));
    void navigate(pathOf(created));
  }
}

// "Cancel" of a meeting: only a planned one (else a note says why); a critical confirmation that cancels it before it
// closes, then the table reloads and a toast says so.
async function cancelMeetingFlow({ dialogs, toasts, nav }: TableContext<MeetingRow>, row: MeetingRow) {
  if (row.status !== 'Planned') {
    void dialogs.warn({
      title: translate('meetings.cancel'),
      content: translate('meetings.cannotCancel', {
        title: row.title,
        status: translate(`statuses.${row.status}`).toLowerCase(),
      }),
    });

    return;
  }

  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('meetings.cancel'),
      content: translate('meetings.cancelContent', { title: row.title, date: formatDateTime(row.start) }),
      buttons: { confirm: translate('meetings.cancel'), cancel: translate('meetings.keep') },
    },
    () => setMeetingStatus(row.id, 'Cancelled'),
  );

  if (done) {
    nav.reload();
    toasts.success(translate('meetings.cancelled', { title: row.title }));
  }
}

// "Edit" of a meeting (in the meetings list and on the meeting's overview): the meeting form in a dialog, saved before
// it closes, then a toast. Resolves `true` when saved.
async function editMeeting(dialogs: Dialogs, toasts: Toasts, id: string): Promise<boolean> {
  const saved = !(await dialogs.form({
    title: translate('meetings.editTitle'),
    content: <MeetingForm meeting={getMeeting(db.getState(), id)} save={(values) => updateMeeting(id, values)} />,
    buttons: { confirm: translate('common.save') },
  })).canceled;

  if (saved) {
    toasts.success(translate('meetings.saved'));
  }

  return saved;
}

// "Delete" of meetings (in the meetings list and on a meeting's overview): a critical confirmation (the agenda, the
// minutes and the documents go with them), then a toast. Resolves `true` when deleted.
async function deleteMeetingsFlow(
  dialogs: Dialogs,
  toasts: Toasts,
  meetings: readonly { id: string; title: string }[],
): Promise<boolean> {
  const [first] = meetings;
  const done = await confirmAndRun(
    dialogs,
    {
      title: translate('meetings.deleteTitle', { count: meetings.length }),
      content: translate('meetings.deleteContent', { count: meetings.length, name: first?.title ?? '' }),
      buttons: { confirm: translate('common.delete') },
    },
    () => deleteMeetings(meetings.map((meeting) => meeting.id)),
  );

  if (done) {
    toasts.success(translate('meetings.deleted', { count: meetings.length, name: first?.title ?? '' }));
  }

  return done;
}
