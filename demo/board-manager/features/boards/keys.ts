export { boardKeys };

// The query keys of the boards feature (TanStack Query): every read under `all`.
const boardKeys = {
  all: ['boards'] as const,
  list: () => [...boardKeys.all, 'list'] as const,
  detail: (id: string) => [...boardKeys.all, 'detail', id] as const,
  members: (boardId: string) => [...boardKeys.all, 'members', boardId] as const,
  candidates: (boardId: string) => [...boardKeys.all, 'candidates', boardId] as const,
};
