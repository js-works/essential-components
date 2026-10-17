export type { SavedFilterRepository, SavedTableFilter };

// A filter of a table saved under a name: the table's filter values by key (plain JSON). `owner`: another user's, which
// only they can change or remove; `shared`: seen by the others too.
type SavedTableFilter = {
  id: string;
  name: string;
  filters: Readonly<Record<string, unknown>>;
  shared: boolean;
  owner?: string;
};

// The saved filters of the tables, by the table's name (`boards`, `meetings`, …): the others' shared ones and the
// user's own. A name saved again replaces the user's filter of that name.
interface SavedFilterRepository {
  list(table: string, signal?: AbortSignal): Promise<readonly SavedTableFilter[]>;
  save(table: string, name: string, filters: Readonly<Record<string, unknown>>, shared: boolean): Promise<void>;
  remove(table: string, id: string): Promise<void>;
  setShared(table: string, id: string, shared: boolean): Promise<void>;
}
