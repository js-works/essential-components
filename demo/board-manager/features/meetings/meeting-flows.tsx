import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import {
  approveMinutes,
  boardIdsOf,
  createMeeting,
  db,
  deleteMeetings,
  getMeeting,
  setMeetingStatus,
  updateMeeting,
} from '../../infra/in-memory/index.js';

import type { Meeting } from '../../domain/index.js';
import type { MeetingRow } from '../../infra/in-memory/index.js';
import { MeetingForm } from '../../shared/forms.js';
import { confirmAndRun } from '../../shared/lib/flows.js';
import type { Dialogs } from '../../shared/lib/flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { formatDateTime } from '../../shared/shared.js';

export {
  useApproveMinutesFlow,
  useCancelMeetingFlow,
  useCreateMeetingFlow,
  useDeleteMeetingsFlow,
  useEditMeetingFlow,
  useMarkHeldFlow,
};

// The flows of the meetings, one hook per use case (the agenda's and the documents' are in their own files). The
// tables follow the data themselves.

// Where a new meeting goes: the board of the list (none: it is chosen, of the person's boards with a person), and
// where a meeting opens.
type NewMeetingPlace = {
  boardId?: string;
  personId?: string;
  pathOf: (meeting: { id: string; boardId: string }) => string;
};

// "New meeting": the meeting form in a dialog, saved before it closes; then a toast, and the new meeting's page.
function useCreateMeetingFlow({ boardId, personId, pathOf }: NewMeetingPlace): () => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();
  const t = useTranslate();

  return async () => {
    const state = db.getState();
    const boardIds = personId === undefined ? undefined : boardIdsOf(state, personId);
    const choices = state.boards.filter((board) => boardIds === undefined || boardIds.includes(board.id));
    let created: { id: string; boardId: string } | undefined;
    const result = await dialogs.form({
      title: t('meetings.new'),
      content: (
        <MeetingForm
          boards={boardId === undefined ? choices : undefined}
          save={async (values) => {
            created = await createMeeting(boardId ?? values.boardId ?? '', values);
          }}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled || created === undefined) {
      return;
    }

    toasts.success(t('meetings.created'));
    void navigate(pathOf(created));
  };
}

// "Edit" of a meeting (in the meetings list and on the meeting's overview): the meeting form in a dialog, saved before
// it closes, then a toast. Resolves `true` when saved.
function useEditMeetingFlow(): (meetingId: string) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (meetingId) => {
    const result = await dialogs.form({
      title: t('meetings.editTitle'),
      content: (
        <MeetingForm
          meeting={getMeeting(db.getState(), meetingId)}
          save={(values) => updateMeeting(meetingId, values)}
        />
      ),
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return false;
    }

    toasts.success(t('meetings.saved'));

    return true;
  };
}

// "Cancel" of a meeting: only a planned one (else a note says why); a critical confirmation that cancels it before it
// closes, then a toast.
function useCancelMeetingFlow(): (meeting: MeetingRow) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (meeting) => {
    if (meeting.status !== 'Planned') {
      void dialogs.warn({
        title: t('meetings.cancel'),
        content: t('meetings.cannotCancel', {
          title: meeting.title,
          status: t(`statuses.${meeting.status}`).toLowerCase(),
        }),
      });

      return;
    }

    const done = await confirmAndRun(
      dialogs,
      {
        title: t('meetings.cancel'),
        content: t('meetings.cancelContent', { title: meeting.title, date: formatDateTime(meeting.start) }),
        buttons: { confirm: t('meetings.cancel'), cancel: t('meetings.keep') },
      },
      () => setMeetingStatus(meeting.id, 'Cancelled'),
    );

    if (!done) {
      return;
    }

    toasts.success(t('meetings.cancelled', { title: meeting.title }));
  };
}

// "Delete" of meetings (in the meetings list and on a meeting's overview): a critical confirmation (the agenda, the
// minutes and the documents go with them), then a toast. Resolves `true` when deleted.
function useDeleteMeetingsFlow(): (meetings: readonly { id: string; title: string }[]) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (meetings) => {
    const [first] = meetings;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('meetings.deleteTitle', { count: meetings.length }),
        content: t('meetings.deleteContent', { count: meetings.length, name: first?.title ?? '' }),
        buttons: { confirm: t('common.delete') },
      },
      () => deleteMeetings(meetings.map((meeting) => meeting.id)),
    );

    if (!done) {
      return false;
    }

    toasts.success(t('meetings.deleted', { count: meetings.length, name: first?.title ?? '' }));

    return true;
  };
}

// A confirmation of the meeting's state (not critical: nothing is lost), in a scope: the dialog stays open while the
// change is saved. Resolves `true` when confirmed and done.
async function confirmChange(
  dialogs: Dialogs,
  config: Parameters<Dialogs['confirm']>[0],
  run: () => Promise<void>,
): Promise<boolean> {
  using scope = dialogs.open();
  const result = await scope.confirm(config);

  if (result.canceled) {
    return false;
  }

  await run();

  return true;
}

// "Approve minutes" of a held meeting: a confirmation, then a toast.
function useApproveMinutesFlow(): (meeting: Meeting) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (meeting) => {
    const done = await confirmChange(
      dialogs,
      {
        title: t('meetings.approveTitle'),
        content: t('meetings.approveContent', { title: meeting.title }),
        buttons: { confirm: t('meetings.approve') },
      },
      () => approveMinutes(meeting.id),
    );

    if (!done) {
      return;
    }

    toasts.success(t('meetings.minutesApproved'));
  };
}

// "Mark as held" of a planned meeting: a confirmation, then a toast.
function useMarkHeldFlow(): (meeting: Meeting) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  return async (meeting) => {
    const done = await confirmChange(
      dialogs,
      {
        title: t('meetings.markHeldTitle'),
        content: t('meetings.markHeldContent', { title: meeting.title }),
        buttons: { confirm: t('meetings.markHeldTitle') },
      },
      () => setMeetingStatus(meeting.id, 'Held'),
    );

    if (!done) {
      return;
    }

    toasts.success(t('meetings.markHeldDone', { title: meeting.title }));
  };
}
