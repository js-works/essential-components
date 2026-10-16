import { Badge } from '@mantine/core';
import type { MeetingStatus } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';

export { MinutesBadge, StatusBadge };

function StatusBadge({ status }: { status: MeetingStatus }) {
  const t = useTranslate();

  // The accent, gray for a cancelled meeting (2026-10-06, the user's wish: no green and yellow badges).
  return (
    <Badge size="sm" variant="light" color={status === 'Cancelled' ? 'gray' : undefined}>
      {t(`statuses.${status}`)}
    </Badge>
  );
}

// Only a held meeting has minutes: a draft until they are approved.
function MinutesBadge(
  { meeting }: { meeting: { status: MeetingStatus; minutesApproved: boolean } },
) {
  const t = useTranslate();

  if (meeting.status !== 'Held') {
    return null;
  }

  return meeting.minutesApproved
    ? <Badge size="sm" variant="filled">{t('meetings.minutesApprovedBadge')}</Badge>
    : <Badge size="sm" variant="outline">{t('meetings.minutesDraftBadge')}</Badge>;
}
