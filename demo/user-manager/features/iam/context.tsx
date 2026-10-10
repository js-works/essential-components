import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext } from 'react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import type { AccessData } from '../../domain';
import { runLocalQuery } from '../../shared/lib/localQuery';
import type { LocalQueryOptions } from '../../shared/lib/localQuery';
import { useQuerySource } from '../../shared/lib/useQuerySource';
import { iamKeys } from './keys';
import type { IamService } from './service';

export { IamServiceContext, useAccessData, useChanged, useIamService, useTableSource };

// The app's service, given by the app (its wiring decides on the repositories behind it).
const IamServiceContext = createContext<IamService | null>(null);

function useIamService(): IamService {
  const service = useContext(IamServiceContext);

  if (service === null) {
    throw new Error('useIamService: no IamServiceContext around it.');
  }

  return service;
}

// Everything access depends on (users, groups, roles, grants, scopes, permissions): one query.
function useAccessData(): AccessData | undefined {
  const service = useIamService();

  // Without the query's signal: TanStack cancels a request that uses its signal when its last observer goes (e.g. in
  // React's StrictMode), and a table's read that shares it would fail. It is a cheap read.
  return useQuery({ queryKey: iamKeys.data(), queryFn: () => service.data() }).data;
}

// After a change: every read again (the data, and every table's pages).
function useChanged(): () => Promise<void> {
  const queryClient = useQueryClient();

  return useCallback(() => queryClient.invalidateQueries({ queryKey: iamKeys.all }), [queryClient]);
}

// A data table's source over rows made from the access data (`rows`), with a local search, filters and sorting
// (`options`). Each page is a query (`iamKeys.table`); a change reloads the table (`reload`, the controller's).
function useTableSource<Row>(
  name: string,
  rows: (data: AccessData) => readonly Row[],
  options: LocalQueryOptions<Row>,
  reload: () => void,
): DataTableComponent.Source<Row> {
  const service = useIamService();
  const queryClient = useQueryClient();

  return useQuerySource<Row>(
    (query) => iamKeys.table(name, query),
    async (query) => {
      const data = await queryClient.fetchQuery({ queryKey: iamKeys.data(), queryFn: () => service.data() });

      return runLocalQuery(rows(data), query, options);
    },
    iamKeys.tables(),
    reload,
  );
}
