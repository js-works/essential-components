import { createFileRoute } from '@tanstack/react-router';

import { MeetingTable } from '../../features/meetings/meeting-table.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';

export const Route = createFileRoute('/meetings/')({ component: MeetingsPage });

// The "Meetings" module: the meetings of all boards, with a board filter.
function MeetingsPage() {
  const t = useTranslate();

  return <MeetingTable title={t('modules.meetings')} subtitle={t('meetings.listSubtitle')} />;
}
