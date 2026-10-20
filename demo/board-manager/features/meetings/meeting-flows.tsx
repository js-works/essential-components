import { useNavigate } from '@tanstack/react-router';

import type { Meeting, MeetingSummary } from '../../domain/index.js';
import type { MeetingFormValues } from '../../shared/forms.js';
import { MeetingForm } from '../../shared/forms.js';
import { useCrudFlows } from '../../shared/lib/crud-flows.js';
import { useFlowKit } from '../../shared/lib/flows.js';
import { formatDateTime } from '../../shared/shared.js';
import { useBoardList } from '../boards/board-data.js';
import { useMembershipList } from '../members/member-data.js';
import { useMeetingService } from './meeting-data.js';

export { useApproveMinutesFlow, useCancelMeetingFlow, useMarkHeldFlow, useMeetingFlows };

// Where a new meeting goes: the board of the list (none: it is chosen, of the person's boards with a person).
type NewMeetingPlace = {
  boardId?: string;
  personId?: string;
};

// "New", "Edit" and "Delete" of meetings; deleting says that the agenda, the minutes and the documents go with them.
function useMeetingFlows({ boardId, personId }: NewMeetingPlace = {}) {
  const { t } = useFlowKit();
  const navigate = useNavigate();
  const service = useMeetingService();
  const boards = useBoardList();
  const memberships = useMembershipList();
  const choices = boards.filter((board) =>
    personId === undefined
    || memberships.some((membership) => membership.boardId === board.id && membership.personId === personId)
  );

  return useCrudFlows<MeetingSummary, MeetingFormValues, Meeting>({
    texts: 'meetings',
    nameOf: (meeting) => meeting.title,
    form: ({ record, save }) => (
      <MeetingForm
        meeting={record}
        boards={record === undefined && boardId === undefined ? choices : undefined}
        save={save}
      />
    ),
    create: (values) => service.create(boardId ?? values.boardId ?? '', values),
    update: service.update,
    remove: service.delete,
    deleteContent: (records) => t('meetings.deleteContent', { count: records.length, name: records[0]?.title ?? '' }),
    created: (meeting) => void navigate({ to: '/meetings/$meetingId', params: { meetingId: meeting.id } }),
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
