import { useFindSource } from './use-find-source.js';
import { useQuerySource } from './use-query-source.js';

export type * from '../api/find.js';
export { useFindSource, useQuerySource };

// The TanStack Query entry, `@local/data-table/react-query`: a data table's source through the app's TanStack Query
// (`@tanstack/react-query`, an optional peer dependency: only this entry needs it).
