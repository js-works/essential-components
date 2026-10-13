import { useState } from 'react';
import type { dataTable } from '../../../../packages/data-table/src/react/index.js';

export { daysFromToday, sharedBy, useSavedFilters };

// The saved filters of the main tables (2026-10-11, the user's wish; the same file in each of the root's five apps: a
// change goes into all five). Not in the tables of a record's page (e.g. a meeting's documents), nor where a table
// has fewer than two filters.

type SavedFilter = dataTable.SavedFilter;

type Filters = Record<string, dataTable.FilterValue>;

// A made-up colleague's shared filter: first in the list, not removable.
function sharedBy(owner: string, name: string, filters: Filters): SavedFilter {
  return { id: `shared:${owner}:${name}`, name, filters, shared: true, owner, removable: false };
}

// The day `days` from today (before it when negative), `yyyy-mm-dd` in local time: for the date ranges of the
// colleagues' filters.
function daysFromToday(days: number): string {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('-');
}

// The saved filters of one table, per browser in `localStorage` under `key`, after the colleagues' shared ones: a name
// saved again replaces the filter of that name; shared ones are only marked (one user here). Without storage (blocked,
// private mode) they live until the page is left.
function useSavedFilters(key: string, colleagues: readonly SavedFilter[] = []): dataTable.SavedFilters {
  const [items, setItems] = useState<readonly SavedFilter[]>(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');

      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  });

  const store = (next: readonly SavedFilter[]) => {
    setItems(next);

    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Not stored: kept in memory only.
    }
  };

  return {
    items: [...colleagues, ...items],
    sharing: true,
    save: (name, filters, { shared }) =>
      store([...items.filter((item) => item.name !== name), { id: crypto.randomUUID(), name, filters, shared }]),
    remove: (id) => store(items.filter((item) => item.id !== id)),
    setShared: (id, shared) => store(items.map((item) => (item.id === id ? { ...item, shared } : item))),
  };
}
