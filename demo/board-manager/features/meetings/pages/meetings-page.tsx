import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { MeetingTable } from '../components/meeting-table.js';
import { meetingLink } from '../meeting-links.js';

export { MeetingsPage };

// A meeting opens below "Meetings" here (the breadcrumb: Meetings › meeting).
// The "Meetings" module: the meetings of all boards, with a board filter.
function MeetingsPage() {
  const t = useTranslate();

  return <MeetingTable linkOf={meetingLink} title={t('modules.meetings')} subtitle={t('meetings.listSubtitle')} />;
}
