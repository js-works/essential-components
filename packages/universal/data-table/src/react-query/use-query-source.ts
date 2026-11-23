import type { QueryKey } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';

import type { RowPage, RowQuery, RowSource } from '../api/query.js';

export { useQuerySource };

// A data table's source through TanStack Query: every page the table loads is a query (`key(query)`), so it is cached
// and deduplicated like any other read of the app. When a query under `watch` is invalidated (a change,
// `invalidateQueries`), the source reports it (`onChange`), and the table reloads: the table loads its pages itself, it
// does not observe them.
function useQuerySource<Row>(
  key: (query: RowQuery) => QueryKey,
  fetch: (query: RowQuery, signal: AbortSignal) => Promise<RowPage<Row>>,
  watch: QueryKey,
): RowSource<Row> {
  const queryClient = useQueryClient();
  const latest = useRef({ key, fetch, watch });

  latest.current = { key, fetch, watch };

  // The query runs on TanStack's own signal: it is shared (another load of the same page gets the same promise), so the
  // table's signal must not cancel it. The table's signal only stops waiting for it.
  const load = useCallback(
    (query: RowQuery, signal: AbortSignal) =>
      new Promise<RowPage<Row>>((resolve, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        queryClient.fetchQuery({
          queryKey: latest.current.key(query),
          queryFn: ({ signal: querySignal }) => latest.current.fetch(query, querySignal),
          staleTime: 30_000,
        }).then(resolve, reject);
      }),
    [queryClient],
  );

  // Stable, so the table subscribes once; the table reloads once for all the queries one change invalidates.
  const onChange = useCallback(
    (listener: () => void) =>
      queryClient.getQueryCache().subscribe((event) => {
        const prefix = latest.current.watch;

        if (
          event.type === 'updated' && event.action.type === 'invalidate'
          && prefix.every((part, index) => JSON.stringify(event.query.queryKey[index]) === JSON.stringify(part))
        ) {
          listener();
        }
      }),
    [queryClient],
  );

  return { load, onChange };
}
