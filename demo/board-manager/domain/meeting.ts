export { MEETING_STATUSES };
export type { Meeting, MeetingStatus };

const MEETING_STATUSES = ['Planned', 'Held', 'Cancelled'] as const;

type MeetingStatus = (typeof MEETING_STATUSES)[number];

// `start` is a local date and time without a time zone (`2026-09-15T10:00`): ISO dates compare as strings.
type Meeting = {
  id: string;
  boardId: string;
  title: string;
  start: string;
  location: string;
  status: MeetingStatus;
  minutesApproved: boolean;
};
