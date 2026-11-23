import type { FilterValue } from './query.js';

export type { SavedFilter, SavedFilterStore, SavedFilters, SaveFilterOptions, StoredFilter };

type SavedFilter = {
  id: string;
  name: string;
  filters: Record<string, FilterValue>;
  shared?: boolean;
  owner?: string;
  removable?: boolean;
};

type SaveFilterOptions = { shared: boolean };

type SavedFilters = {
  items: readonly SavedFilter[];
  save: (name: string, filters: Record<string, FilterValue>, options: SaveFilterOptions) => void | Promise<void>;
  remove: (id: string) => void | Promise<void>;
  sharing?: boolean;
  setShared?: (id: string, shared: boolean) => void | Promise<void>;
};

type StoredFilter = {
  id: string;
  name: string;
  filters: Readonly<Record<string, unknown>>;
  shared: boolean;
  owner?: string;
};

type SavedFilterStore = {
  list: (table: string, signal?: AbortSignal) => Promise<readonly StoredFilter[]>;
  save: (table: string, name: string, filters: Readonly<Record<string, unknown>>, shared: boolean) => Promise<void>;
  remove: (table: string, id: string) => Promise<void>;
  setShared: (table: string, id: string, shared: boolean) => Promise<void>;
};
