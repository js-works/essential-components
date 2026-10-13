import type { dataTable } from '../../../../packages/data-table/src/react/index.js';

export { hrKeys };

// The query keys of the app (TanStack Query): every read under `all`, so a change invalidates them together.
const hrKeys = {
  all: ['human-resources'] as const,
  data: () => [...hrKeys.all, 'data'] as const,
  tables: () => [...hrKeys.all, 'table'] as const,
  table: (name: string, query: dataTable.Query) => [...hrKeys.tables(), name, query] as const,
};
