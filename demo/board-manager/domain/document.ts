export type { MeetingDocument };

// The type is the extension in capitals (`PDF`), like in the media manager.
type MeetingDocument = {
  id: string;
  meetingId: string;
  name: string;
  type: string;
  size: number;
  user: string;
  uploaded: string;
};
