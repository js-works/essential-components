export type { MeetingLink };
export { boardMeetingLink, meetingLink };

// The page of a meeting: below its board (`/boards/$boardId/meetings/$meetingId`), or in "Meetings"
// (`/meetings/$meetingId`). Link options, for a `Link` or `navigate()`.
type MeetingLink = ReturnType<typeof boardMeetingLink> | ReturnType<typeof meetingLink>;

function boardMeetingLink(meeting: { id: string; boardId: string }) {
  return {
    to: '/boards/$boardId/meetings/$meetingId',
    params: { boardId: meeting.boardId, meetingId: meeting.id },
  } as const;
}

function meetingLink(meeting: { id: string }) {
  return { to: '/meetings/$meetingId', params: { meetingId: meeting.id } } as const;
}
