import type { DataNavigatorComponent as Spec } from '../react/api';

export { fallbackSummary, isRecord, optionsOf, sameValue, withoutKey };
export type { FilterSummary, NormalizedOption, SummaryContext };

type NormalizedOption = { value: string; label: string };

// What the pill of an active filter shows after the label of its column. `relation` is what stands between the label
// and the value (`Status: Open`, `Amount ≥ 1,000`; `''` for `Amount 1,000–5,000`). A text filter shows its value in a
// small box, with faded `⋯` where other text may be (`before`, `after`). `more` is the number of values that are left
// out (`Open +2`).
type FilterSummary = {
  relation: ':' | '≥' | '≤' | '=' | '';
  value: string;
  boxed?: boolean;
  before?: boolean;
  after?: boolean;
  more?: number;
};

// What a summary may need: the locale (numbers, dates) and the texts (Yes, No).
type SummaryContext = { locale: string; texts: Spec.Texts };

function optionsOf(options: readonly Spec.FilterOption[]): NormalizedOption[] {
  return options.map((option) => (typeof option === 'string' ? { value: option, label: option } : option));
}

// Unlike Array.isArray, this also rules out readonly arrays in the false branch.
function isList(value: object): value is readonly Spec.FilterValue[] {
  return Array.isArray(value);
}

// A filter value that is a JSON object (not a list, not null).
function isRecord(
  value: Spec.FilterValue | undefined,
): value is { readonly [key: string]: Spec.FilterValue } {
  return typeof value === 'object' && value !== null && !isList(value);
}

// Two filter values are the same if they are equal as JSON values (so an equal value does not reload).
function sameValue(a: Spec.FilterValue | undefined, b: Spec.FilterValue | undefined): boolean {
  if (a === b) {
    return true;
  }

  if (
    a === undefined || b === undefined || a === null || b === null || typeof a !== 'object' || typeof b !== 'object'
  ) {
    return false;
  }

  if (isList(a) || isList(b)) {
    return isList(a) && isList(b) && a.length === b.length && a.every((item, index) => sameValue(item, b[index]));
  }

  const keys = Object.keys(a);

  return keys.length === Object.keys(b).length && keys.every((key) => key in b && sameValue(a[key], b[key]));
}

function withoutKey<T>(record: Readonly<Record<string, T>>, key: string): Readonly<Record<string, T>> {
  return Object.fromEntries(Object.entries(record).filter(([name]) => name !== key));
}

// The pill of a filter the library does not know (an app's own one): strings, numbers and booleans as they are, a list
// by its values, anything else as JSON.
function fallbackSummary(value: Spec.FilterValue): FilterSummary {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return { relation: ':', value: String(value) };
  }

  if (isList(value)) {
    return {
      relation: ':',
      value: value.map((item) => (typeof item === 'string' ? item : JSON.stringify(item))).join(', '),
    };
  }

  return { relation: ':', value: JSON.stringify(value) };
}
