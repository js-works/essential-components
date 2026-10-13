import type { FilterValue } from './query.js';

export type { SavedFilter, SavedFilters, SaveFilterOptions };

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
