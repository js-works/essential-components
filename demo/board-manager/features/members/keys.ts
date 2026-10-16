export { memberKeys };

// The query keys of the members feature (TanStack Query): every read under `all`.
const memberKeys = {
  all: ['people'] as const,
  list: () => [...memberKeys.all, 'list'] as const,
  detail: (id: string) => [...memberKeys.all, 'detail', id] as const,
  memberships: () => [...memberKeys.all, 'memberships'] as const,
  boards: (personId: string) => [...memberKeys.all, 'boards', personId] as const,
};
