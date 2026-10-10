import type { DataTableComponent } from '../../../../packages/data-table/src/react';

export { trackerKeys };

// The query keys of the app (TanStack Query): every read under `all`, so a change invalidates them together.
const trackerKeys = {
  all: ['time-tracker'] as const,
  data: () => [...trackerKeys.all, 'data'] as const,
  tables: () => [...trackerKeys.all, 'table'] as const,
  table: (name: string, query: DataTableComponent.Query) => [...trackerKeys.tables(), name, query] as const,
};
