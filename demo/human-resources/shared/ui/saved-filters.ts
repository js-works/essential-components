import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useContext } from 'react';

import type { FilterValue, SavedFilters } from '@local/data-table/react';

import type { SavedFilterRepository } from '../../domain/index.js';

export { SavedFilterServiceContext, useSavedFilters };

// Where the saved filters are kept, given by the app (its wiring decides on the repository). The same file in each of
// the root's five apps: a change goes into all five.
const SavedFilterServiceContext = createContext<SavedFilterRepository | null>(null);

// The saved filters of one of the main tables (`table`: its name, e.g. `boards`), for the data table's `savedFilters`:
// the others' shared ones (only marked, not removable) and the user's own, through TanStack Query. Only in the main
// tables of the modules with at least two filters, not in a record's page (e.g. a meeting's documents).
function useSavedFilters(table: string): SavedFilters {
  const service = useContext(SavedFilterServiceContext);

  if (service === null) {
    throw new Error('useSavedFilters: no SavedFilterServiceContext around it.');
  }

  const queryClient = useQueryClient();
  const queryKey = ['saved-filters', table];
  const { data = [] } = useQuery({ queryKey, queryFn: ({ signal }) => service.list(table, signal) });
  const then = async (change: Promise<void>) => {
    await change;
    await queryClient.invalidateQueries({ queryKey });
  };

  return {
    items: data.map((filter) => ({
      id: filter.id,
      name: filter.name,
      filters: filter.filters as Record<string, FilterValue>,
      shared: filter.shared,
      owner: filter.owner,
      removable: filter.owner === undefined,
    })),
    sharing: true,
    save: (name, filters, { shared }) => then(service.save(table, name, filters, shared)),
    remove: (id) => then(service.remove(table, id)),
    setShared: (id, shared) => then(service.setShared(table, id, shared)),
  };
}
