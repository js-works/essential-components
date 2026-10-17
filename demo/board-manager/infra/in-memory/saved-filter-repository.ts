import type { SavedFilterRepository, SavedTableFilter } from '../../domain/index.js';

export { createSavedFilterRepository };

// The saved filters of the tables (the same file in each of the root's five apps: a change goes into all five): the
// others' shared ones (`others`, by table, first in each list) and the user's own, per browser in `localStorage`
// (`<prefix>:<table>`); without storage (blocked, private mode) only in memory, until the page is left.
function createSavedFilterRepository(
  prefix: string,
  others: Readonly<Record<string, readonly SavedTableFilter[]>>,
): SavedFilterRepository {
  const memory = new Map<string, readonly SavedTableFilter[]>();
  const keyOf = (table: string) => `${prefix}:${table}`;

  const own = (table: string): readonly SavedTableFilter[] => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(keyOf(table)) ?? 'null');

      return Array.isArray(stored) ? stored : memory.get(table) ?? [];
    } catch {
      return memory.get(table) ?? [];
    }
  };

  const store = (table: string, filters: readonly SavedTableFilter[]) => {
    memory.set(table, filters);

    try {
      localStorage.setItem(keyOf(table), JSON.stringify(filters));
    } catch {
      // Not stored: kept in memory only.
    }
  };

  return {
    async list(table) {
      return [...(others[table] ?? []), ...own(table).map((filter) => ({ ...filter, shared: filter.shared ?? false }))];
    },
    async save(table, name, filters, shared) {
      store(table, [
        ...own(table).filter((filter) => filter.name !== name),
        { id: crypto.randomUUID(), name, filters, shared },
      ]);
    },
    async remove(table, id) {
      store(table, own(table).filter((filter) => filter.id !== id));
    },
    async setShared(table, id, shared) {
      store(table, own(table).map((filter) => (filter.id === id ? { ...filter, shared } : filter)));
    },
  };
}
