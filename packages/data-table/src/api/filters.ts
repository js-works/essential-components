import type { FilterValue } from './query.js';

export type {
  DateRangeFilterValue,
  FilterOption,
  FilterProps,
  NumberRangeFilterValue,
  SelectColumnFilterSettings,
  TextColumnFilterSettings,
  TextFilterMatch,
  TextFilterValue,
};

type FilterProps = {
  value: FilterValue | undefined;
  onChange: (value: FilterValue | undefined) => void;
  labelledBy: string;
};

type FilterOption = string | { value: string; label: string };

type TextColumnFilterSettings = { placeholder?: string; matchModes?: boolean };

type TextFilterMatch = 'contains' | 'startsWith' | 'endsWith';

type TextFilterValue = { text: string; match: TextFilterMatch };

type SelectColumnFilterSettings = { options: readonly FilterOption[]; multiple?: boolean };

type DateRangeFilterValue = { from: string; to: string };

type NumberRangeFilterValue = { from?: number; to?: number };
