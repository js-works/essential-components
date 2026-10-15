import type { RowQuery } from '@local/data-table/react';

export { iamKeys };

// The query keys of the app (TanStack Query): every read under `all`, so a change invalidates them together.
const iamKeys = {
  all: ['iam'] as const,
  data: () => [...iamKeys.all, 'data'] as const,
  tables: () => [...iamKeys.all, 'table'] as const,
  table: (name: string, query: RowQuery) => [...iamKeys.tables(), name, query] as const,
};
