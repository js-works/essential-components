import type { RowQuery, RowSource } from '@local/data-table/react';
import type { QueryKey } from '@tanstack/react-query';
import type { Page, Paging, Sort } from '../../domain/index.js';
import { useQuerySource } from './use-query-source.js';

export { searchText, toPaging, toSort, usePageSource };

// A table's query as the domain's: its search (`undefined` when empty), its sort (a key the domain sorts by, else
// none) and its page (a window).

function searchText({ search }: RowQuery): string | undefined {
  return search.trim() === '' ? undefined : search;
}

function toSort<K extends string>({ sort }: RowQuery, keys: readonly K[]): Sort<K> | undefined {
  const key = keys.find((candidate) => candidate === sort?.key);

  return sort === undefined || key === undefined ? undefined : { key, direction: sort.direction };
}

function toPaging({ page, pageSize }: RowQuery): Paging {
  return { offset: (page - 1) * pageSize, limit: pageSize };
}

// A table's pages through TanStack Query, each under `scope` (keyed by the table's query, plain JSON): the table
// reloads when a read under `scope` is invalidated (a change, `changed()`).
function usePageSource<Row>(
  scope: QueryKey,
  find: (query: RowQuery, signal: AbortSignal) => Promise<Page<Row>>,
  reload: () => void,
): RowSource<Row> {
  return useQuerySource<Row>(
    (query) => [...scope, 'page', query],
    async (query, signal) => {
      const page = await find(query, signal);

      return { rows: page.items, total: page.total };
    },
    scope,
    reload,
  );
}
