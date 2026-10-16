import { useDialogs, useToast } from '@local/overlays/react';
import { useNavigate } from 'react-router';
import type { Meeting } from '../../domain/index.js';
import { MeetingForm } from '../../shared/forms.js';
import { confirmAndRun } from '../../shared/lib/flows.js';
import type { Dialogs } from '../../shared/lib/flows.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { useChanged } from '../../shared/lib/use-changed.js';
import { formatDateTime } from '../../shared/shared.js';
import { useBoardList } from '../boards/reads.js';
import { useMembershipList } from '../members/reads.js';
import { useMeetingService } from './context.js';

export {
  useApproveMinutesFlow,
  useCancelMeetingFlow,
  useCreateMeetingFlow,
  useDeleteMeetingsFlow,
  useEditMeetingFlow,
  useMarkHeldFlow,
};

// The flows of the meetings, one hook per use case (the agenda's and the documents' are in their own files). A flow
// changes the data through the service and says so (`changed()`); it knows no table.

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
  const service = useMeetingService();
  const changed = useChanged();
  const boards = useBoardList();
  const memberships = useMembershipList();

  return async () => {
    const choices = boards.filter((board) =>
      personId === undefined
      || memberships.some((membership) => membership.boardId === board.id && membership.personId === personId)
    );
    let created: { id: string; boardId: string } | undefined;
    const result = await dialogs.form({
      title: t('meetings.new'),
      content: (
        <MeetingForm
          boards={boardId === undefined ? choices : undefined}
          save={async (values) => {
            created = await service.create(boardId ?? values.boardId ?? '', values);
          }}
        />
      ),
      buttons: { confirm: t('common.create') },
    });

    if (result.canceled || created === undefined) {
      return;
    }

    void changed();
    toasts.success(t('meetings.created'));
    void navigate(pathOf(created));
  };
}

// "Edit" of a meeting (in the meetings list and on the meeting's overview): the meeting form in a dialog, saved before
// it closes, then a toast. Resolves `true` when saved.
function useEditMeetingFlow(): (meeting: Meeting) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useMeetingService();
  const changed = useChanged();

  return async (meeting) => {
    const result = await dialogs.form({
      title: t('meetings.editTitle'),
      content: <MeetingForm meeting={meeting} save={(values) => service.update(meeting.id, values)} />,
      buttons: { confirm: t('common.save') },
    });

    if (result.canceled) {
      return false;
    }

    void changed();
    toasts.success(t('meetings.saved'));

    return true;
  };
}

// "Cancel" of a meeting: only a planned one (else a note says why); a critical confirmation that cancels it before it
// closes, then a toast.
function useCancelMeetingFlow(): (meeting: Meeting) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useMeetingService();
  const changed = useChanged();

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
      () => service.setStatus(meeting.id, 'Cancelled'),
    );

    if (!done) {
      return;
    }

    void changed();
    toasts.success(t('meetings.cancelled', { title: meeting.title }));
  };
}

// "Delete" of meetings (in the meetings list and on a meeting's overview): a critical confirmation (the agenda, the
// minutes and the documents go with them), then a toast. Resolves `true` when deleted.
function useDeleteMeetingsFlow(): (meetings: readonly { id: string; title: string }[]) => Promise<boolean> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useMeetingService();
  const changed = useChanged();

  return async (meetings) => {
    const [first] = meetings;
    const done = await confirmAndRun(
      dialogs,
      {
        title: t('meetings.deleteTitle', { count: meetings.length }),
        content: t('meetings.deleteContent', { count: meetings.length, name: first?.title ?? '' }),
        buttons: { confirm: t('common.delete') },
      },
      () => service.delete(meetings.map((meeting) => meeting.id)),
    );

    if (!done) {
      return false;
    }

    void changed();
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
  const service = useMeetingService();
  const changed = useChanged();

  return async (meeting) => {
    const done = await confirmChange(
      dialogs,
      {
        title: t('meetings.approveTitle'),
        content: t('meetings.approveContent', { title: meeting.title }),
        buttons: { confirm: t('meetings.approve') },
      },
      () => service.approveMinutes(meeting.id),
    );

    if (!done) {
      return;
    }

    void changed();
    toasts.success(t('meetings.minutesApproved'));
  };
}

// "Mark as held" of a planned meeting: a confirmation, then a toast.
function useMarkHeldFlow(): (meeting: Meeting) => Promise<void> {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();
  const service = useMeetingService();
  const changed = useChanged();

  return async (meeting) => {
    const done = await confirmChange(
      dialogs,
      {
        title: t('meetings.markHeldTitle'),
        content: t('meetings.markHeldContent', { title: meeting.title }),
        buttons: { confirm: t('meetings.markHeldTitle') },
      },
      () => service.setStatus(meeting.id, 'Held'),
    );

    if (!done) {
      return;
    }

    void changed();
    toasts.success(t('meetings.markHeldDone', { title: meeting.title }));
  };
}
