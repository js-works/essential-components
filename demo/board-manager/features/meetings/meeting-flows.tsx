import { useNavigate } from 'react-router';

import type { Meeting } from '../../domain/index.js';
import { MeetingForm } from '../../shared/forms.js';
import { useFlowKit } from '../../shared/lib/flows.js';
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
// changes the data through the service (which says so: every read loads again); it knows no
// table.

// Where a new meeting goes: the board of the list (none: it is chosen, of the person's boards with a person), and
// where a meeting opens.
type NewMeetingPlace = {
  boardId?: string;
  personId?: string;
  pathOf: (meeting: { id: string; boardId: string }) => string;
};

// "New meeting": the meeting form in a dialog, saved before it closes; then a toast, and the new meeting's page.
function useCreateMeetingFlow({ boardId, personId, pathOf }: NewMeetingPlace): () => Promise<void> {
  const { formFlow, t } = useFlowKit();
  const navigate = useNavigate();
  const service = useMeetingService();
  const boards = useBoardList();
  const memberships = useMembershipList();

  return async () => {
    const choices = boards.filter((board) =>
      personId === undefined
      || memberships.some((membership) => membership.boardId === board.id && membership.personId === personId)
    );
    let created: { id: string; boardId: string } | undefined;
    const done = await formFlow({
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
      success: t('meetings.created'),
    });

    if (done && created !== undefined) {
      void navigate(pathOf(created));
    }
  };
}

// "Edit" of a meeting (in the meetings list and on the meeting's overview): the meeting form in a dialog, saved before
// it closes, then a toast. Resolves `true` when saved.
function useEditMeetingFlow(): (meeting: Meeting) => Promise<boolean> {
  const { formFlow, t } = useFlowKit();
  const service = useMeetingService();

  return (meeting) =>
    formFlow({
      title: t('meetings.editTitle'),
      content: <MeetingForm meeting={meeting} save={(values) => service.update(meeting.id, values)} />,
      buttons: { confirm: t('common.save') },
      success: t('meetings.saved'),
    });
}

// "Cancel" of a meeting: only a planned one (else a note says why); a critical confirmation that cancels it before it
// closes, then a toast.
function useCancelMeetingFlow(): (meeting: Meeting) => Promise<boolean> {
  const { dialogs, confirmFlow, t } = useFlowKit();
  const service = useMeetingService();

  return async (meeting) => {
    if (meeting.status !== 'Planned') {
      void dialogs.warn({
        title: t('meetings.cancel'),
        content: t('meetings.cannotCancel', {
          title: meeting.title,
          status: t(`statuses.${meeting.status}`).toLowerCase(),
        }),
      });

      return false;
    }

    return confirmFlow({
      critical: true,
      title: t('meetings.cancel'),
      content: t('meetings.cancelContent', { title: meeting.title, date: formatDateTime(meeting.start) }),
      buttons: { confirm: t('meetings.cancel'), cancel: t('meetings.keep') },
      run: () => service.setStatus(meeting.id, 'Cancelled'),
      success: t('meetings.cancelled', { title: meeting.title }),
    });
  };
}

// "Delete" of meetings (in the meetings list and on a meeting's overview): a critical confirmation (the agenda, the
// minutes and the documents go with them), then a toast. Resolves `true` when deleted.
function useDeleteMeetingsFlow(): (meetings: readonly { id: string; title: string }[]) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useMeetingService();

  return (meetings) => {
    const count = meetings.length;
    const name = meetings[0]?.title ?? '';

    return confirmFlow({
      critical: true,
      title: t('meetings.deleteTitle', { count }),
      content: t('meetings.deleteContent', { count, name }),
      buttons: { confirm: t('common.delete') },
      run: () => service.delete(meetings.map((meeting) => meeting.id)),
      success: t('meetings.deleted', { count, name }),
    });
  };
}

// "Approve minutes" of a held meeting: a confirmation (not critical: nothing is lost), then a toast.
function useApproveMinutesFlow(): (meeting: Meeting) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useMeetingService();

  return (meeting) =>
    confirmFlow({
      title: t('meetings.approveTitle'),
      content: t('meetings.approveContent', { title: meeting.title }),
      buttons: { confirm: t('meetings.approve') },
      run: () => service.approveMinutes(meeting.id),
      success: t('meetings.minutesApproved'),
    });
}

// "Mark as held" of a planned meeting: a confirmation (not critical), then a toast.
function useMarkHeldFlow(): (meeting: Meeting) => Promise<boolean> {
  const { confirmFlow, t } = useFlowKit();
  const service = useMeetingService();

  return (meeting) =>
    confirmFlow({
      title: t('meetings.markHeldTitle'),
      content: t('meetings.markHeldContent', { title: meeting.title }),
      buttons: { confirm: t('meetings.markHeldTitle') },
      run: () => service.setStatus(meeting.id, 'Held'),
      success: t('meetings.markHeldDone', { title: meeting.title }),
    });
}
