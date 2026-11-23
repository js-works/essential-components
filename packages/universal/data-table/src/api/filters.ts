import type { FilterValue } from './query.js';

export type {
  DateRangeFilterValue,
  FilterOption,
  FilterProps,
  NumberRangeFilterValue,
  SelectFilterSettings,
  TextFilterMatch,
  TextFilterSettings,
  TextFilterValue,
};

type FilterProps = {
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
  labelledBy: string;
};

type FilterOption = string | { value: string; label: string };

type TextFilterSettings = { placeholder?: string; matchModes?: boolean };

type TextFilterMatch = 'contains' | 'startsWith' | 'endsWith';

type TextFilterValue = { text: string; match: TextFilterMatch };

type SelectFilterSettings = { options: readonly FilterOption[]; multiple?: boolean };

type DateRangeFilterValue = { from: string; to: string };

type NumberRangeFilterValue = { from?: number; to?: number };
