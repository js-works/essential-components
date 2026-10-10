import { useQueryClient } from '@tanstack/react-query';
import type { QueryKey } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';

export { useQuerySource };

// A data table's source through TanStack Query: every page it loads is a query (`key(query)`), so it is cached and
// deduplicated like any other read. When a query under `watch` is invalidated (a change, `invalidateQueries`), the
// table reloads (`reload`, e.g. the controller's): the data table loads its pages itself, it does not observe them.
function useQuerySource<Row>(
  key: (query: DataTableComponent.Query) => QueryKey,
  fetch: (query: DataTableComponent.Query, signal: AbortSignal) => Promise<DataTableComponent.Result<Row>>,
  watch: QueryKey,
  reload: () => void,
): DataTableComponent.Source<Row> {
  const queryClient = useQueryClient();
  const latest = useRef({ key, fetch, reload, watch });

  latest.current = { key, fetch, reload, watch };

  useEffect(() => {
    let pending = false;

    return queryClient.getQueryCache().subscribe((event) => {
      const { watch: prefix } = latest.current;

      if (
        event.type === 'updated' && event.action.type === 'invalidate'
        && prefix.every((part, index) => JSON.stringify(event.query.queryKey[index]) === JSON.stringify(part))
        && !pending
      ) {
        // One reload for all the queries one change invalidates.
        pending = true;
        queueMicrotask(() => {
          pending = false;
          latest.current.reload();
        });
      }
    });
  }, [queryClient]);

  // The query runs on TanStack's own signal: it is shared (another load of the same page gets the same promise), so the
  // table's signal must not cancel it. The table's signal only stops waiting for it.
  return useCallback(
    (query, signal) =>
      new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        queryClient.fetchQuery({
          queryKey: latest.current.key(query),
          queryFn: ({ signal: querySignal }) => latest.current.fetch(query, querySignal),
          staleTime: 30_000,
        }).then(resolve, reject);
      }),
    [queryClient],
  );
}
