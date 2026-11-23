import type { QueryKey } from '@tanstack/react-query';

import type { FindRows } from '../api/find.js';
import type { RowQuery, RowSource } from '../api/query.js';
import { pagingOf, sortOf } from '../core/query-helpers.js';
import { useQuerySource } from './use-query-source.js';

export { useFindSource };

// A data table's source over a `find` that takes criteria, a sort and a window of rows (a repository, a server), through
// TanStack Query: each page under `scope` (keyed by the table's query, plain JSON), with the query as the find's
// (`toCriteria`, the sort if its key is one of `sortKeys`, the page as offset and limit). The source reports it when a
// read under `scope` is invalidated (a change), and the table reloads.
function useFindSource<Row, Criteria, K extends string>(
  scope: QueryKey,
  sortKeys: readonly K[],
  toCriteria: (query: RowQuery) => Criteria,
  find: FindRows<Row, Criteria, K>,
): RowSource<Row> {
  return useQuerySource<Row>(
    (query) => [...scope, 'page', query],
    async (query, signal) => {
      const page = await find(toCriteria(query), sortOf(query, sortKeys), pagingOf(query), signal);

      return { rows: page.items, total: page.total };
    },
    scope,
  );
}
