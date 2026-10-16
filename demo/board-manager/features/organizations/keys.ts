export { organizationKeys };

// The query keys of the organizations feature (TanStack Query): every read under `all`.
const organizationKeys = {
  all: ['organizations'] as const,
  list: () => [...organizationKeys.all, 'list'] as const,
  detail: (id: string) => [...organizationKeys.all, 'detail', id] as const,
};
