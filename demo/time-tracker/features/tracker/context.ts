import type { RowSource } from '@local/data-table/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext } from 'react';
import type { TimeData } from '../../domain/index.js';
import { runLocalQuery } from '../../shared/lib/local-query.js';
import type { LocalQueryOptions } from '../../shared/lib/local-query.js';
import { useQuerySource } from '../../shared/lib/use-query-source.js';
import { trackerKeys } from './keys.js';
import type { TimeService } from './service.js';

export { TimeServiceContext, useChanged, useTableSource, useTimeData, useTimeService };

// The app's service, given by the app (its wiring decides on the repositories behind it).
const TimeServiceContext = createContext<TimeService | null>(null);

function useTimeService(): TimeService {
  const service = useContext(TimeServiceContext);

  if (service === null) {
    throw new Error('useTimeService: no TimeServiceContext around it.');
  }

  return service;
}

// Everything the app shows: one query.
function useTimeData(): TimeData | undefined {
  const service = useTimeService();

  // Without the query's signal: TanStack cancels a request that uses its signal when its last observer goes (e.g. in
  // React's StrictMode), and a table's read that shares it would fail. It is a cheap read.
  return useQuery({ queryKey: trackerKeys.data(), queryFn: () => service.data() }).data;
}

// After a change: every read again (the data, and every table's pages).
function useChanged(): () => Promise<void> {
  const queryClient = useQueryClient();

  return useCallback(() => queryClient.invalidateQueries({ queryKey: trackerKeys.all }), [queryClient]);
}

// A data table's source over rows made from the data (`rows`), with a local search, filters and sorting
// (`options`). Each page is a query (`trackerKeys.table`); a change reloads the table (`reload`, the controller's).
// `name` tells the tables apart; it includes what `rows` depends on besides the data (e.g. the shown employee).
function useTableSource<Row>(
  name: string,
  rows: (data: TimeData) => readonly Row[],
  options: LocalQueryOptions<Row>,
  reload: () => void,
): RowSource<Row> {
  const service = useTimeService();
  const queryClient = useQueryClient();

  return useQuerySource<Row>(
    (query) => trackerKeys.table(name, query),
    async (query) => {
      const data = await queryClient.fetchQuery({ queryKey: trackerKeys.data(), queryFn: () => service.data() });

      return runLocalQuery(rows(data), query, options);
    },
    trackerKeys.tables(),
    reload,
  );
}
