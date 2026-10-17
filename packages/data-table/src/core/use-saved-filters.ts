import { useEffect, useState } from 'react';

import type { FilterValue } from '../api/query.js';
import type { SavedFilterStore, SavedFilters, StoredFilter } from '../api/saved-filters.js';

export { useSavedFilters };

// A table's saved filters (`savedFilters`) from a store of the app, by the table's name: the list is loaded when the
// table mounts and again after each change. The others' filters (with an `owner`) are only marked: not removable.
function useSavedFilters(store: SavedFilterStore, table: string): SavedFilters {
  const [items, setItems] = useState<readonly StoredFilter[]>([]);
  // Counts the changes: a new count loads the list again.
  const [changes, setChanges] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    store.list(table, controller.signal).then(
      (list) => {
        if (!controller.signal.aborted) {
          setItems(list);
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
        }
      },
    );

    return () => controller.abort();
  }, [store, table, changes]);

  const then = async (change: Promise<void>) => {
    await change;
    setChanges((count) => count + 1);
  };

  return {
    items: items.map((filter) => ({
      id: filter.id,
      name: filter.name,
      filters: filter.filters as Record<string, FilterValue>,
      shared: filter.shared,
      owner: filter.owner,
      removable: filter.owner === undefined,
    })),
    sharing: true,
    save: (name, filters, { shared }) => then(store.save(table, name, filters, shared)),
    remove: (id) => then(store.remove(table, id)),
    setShared: (id, shared) => then(store.setShared(table, id, shared)),
  };
}
