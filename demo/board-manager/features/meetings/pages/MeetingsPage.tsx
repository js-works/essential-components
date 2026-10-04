import type { ReactElement } from 'react';
import { useTranslate } from '../../../shared/lib/i18n';
import { MeetingsTable } from '../components/MeetingsTable';

export { MeetingsPage };

// A meeting opens below "Meetings" here (the breadcrumb: Meetings › meeting).
const meetingPath = (meeting: { id: string }) => `/meetings/${meeting.id}`;

// The "Meetings" module: the meetings of all boards, with a board filter.
function MeetingsPage(): ReactElement {
  const t = useTranslate();

  return <MeetingsTable pathOf={meetingPath} title={t('modules.meetings')} subtitle={t('meetings.listSubtitle')} />;
}
