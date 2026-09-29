import type { ReactElement } from 'react';
import { MeetingsTable } from './MeetingsTable';

export { MeetingsPage };

// A meeting opens below "Meetings" here (the breadcrumb: Meetings › meeting).
const meetingPath = (meeting: { id: string }) => `/meetings/${meeting.id}`;

// The "Meetings" module: the meetings of all boards, with a board filter.
function MeetingsPage(): ReactElement {
  return (
    <MeetingsTable
      pathOf={meetingPath}
      title="Meetings"
      subtitle="The meetings of all boards, the latest first. Filter by board, status or date."
    />
  );
}
