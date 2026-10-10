import type { DataTableComponent } from '../../../../packages/data-table/src/react';

export { hrKeys };

// The query keys of the app (TanStack Query): every read under `all`, so a change invalidates them together.
const hrKeys = {
  all: ['human-resources'] as const,
  data: () => [...hrKeys.all, 'data'] as const,
  tables: () => [...hrKeys.all, 'table'] as const,
  table: (name: string, query: DataTableComponent.Query) => [...hrKeys.tables(), name, query] as const,
};
