import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext } from 'react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import type { HrData } from '../../domain';
import { runLocalQuery } from '../../shared/lib/localQuery';
import type { LocalQueryOptions } from '../../shared/lib/localQuery';
import { useQuerySource } from '../../shared/lib/useQuerySource';
import { hrKeys } from './keys';
import type { HrService } from './service';

export { HrServiceContext, useChanged, useHrData, useHrService, useTableSource };

// The app's service, given by the app (its wiring decides on the repositories behind it).
const HrServiceContext = createContext<HrService | null>(null);

function useHrService(): HrService {
  const service = useContext(HrServiceContext);

  if (service === null) {
    throw new Error('useHrService: no HrServiceContext around it.');
  }

  return service;
}

// Everything the app shows: one query.
function useHrData(): HrData | undefined {
  const service = useHrService();

  // Without the query's signal: TanStack cancels a request that uses its signal when its last observer goes (e.g. in
  // React's StrictMode), and a table's read that shares it would fail. It is a cheap read.
  return useQuery({ queryKey: hrKeys.data(), queryFn: () => service.data() }).data;
}

// After a change: every read again (the data, and every table's pages).
function useChanged(): () => Promise<void> {
  const queryClient = useQueryClient();

  return useCallback(() => queryClient.invalidateQueries({ queryKey: hrKeys.all }), [queryClient]);
}

// A data table's source over rows made from the data (`rows`), with a local search, filters and sorting
// (`options`). Each page is a query (`hrKeys.table`); a change reloads the table (`reload`, the controller's). `name`
// tells the tables apart; it includes what `rows` depends on besides the data (e.g. the shown employee).
function useTableSource<Row>(
  name: string,
  rows: (data: HrData) => readonly Row[],
  options: LocalQueryOptions<Row>,
  reload: () => void,
): DataTableComponent.Source<Row> {
  const service = useHrService();
  const queryClient = useQueryClient();

  return useQuerySource<Row>(
    (query) => hrKeys.table(name, query),
    async (query) => {
      const data = await queryClient.fetchQuery({ queryKey: hrKeys.data(), queryFn: () => service.data() });

      return runLocalQuery(rows(data), query, options);
    },
    hrKeys.tables(),
    reload,
  );
}
