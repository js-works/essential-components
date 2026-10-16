export { meetingKeys };

// The query keys of the meetings feature (TanStack Query): every read under `all`.
const meetingKeys = {
  all: ['meetings'] as const,
  list: () => [...meetingKeys.all, 'list'] as const,
  detail: (id: string) => [...meetingKeys.all, 'detail', id] as const,
  agenda: (meetingId: string) => [...meetingKeys.all, 'agenda', meetingId] as const,
  documents: (meetingId: string) => [...meetingKeys.all, 'documents', meetingId] as const,
  members: (boardId: string) => [...meetingKeys.all, 'members', boardId] as const,
  boards: () => [...meetingKeys.all, 'boards'] as const,
};
