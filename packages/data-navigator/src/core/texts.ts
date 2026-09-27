import { useContext, useEffect, useMemo, useState } from 'react';
import type { DataNavigatorComponent as Spec } from '../react/api';
import { ConfigContext } from './config';

export { useLocale, useTexts };

// The namespace of our texts in an `I18nAdapter`.
const NAMESPACE = 'datanav';

const FALLBACK_LOCALE = 'en-US';

// The English texts of last resort, with `{name}` placeholders. Numbers are formatted in the current locale.
const defaultTexts = {
  selectedCount: '{count} selected',
  itemRange: 'Items {from}-{to} / {total}',
  pageSize: 'Page Size',
  page: 'Page',
  pageOf: 'of {pages}',
  firstPage: 'First page',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  lastPage: 'Last page',
  empty: 'No entries',
  emptySearch: 'No results found',
  searchPlaceholder: 'Search',
  clearFilter: 'Clear filter',
  filterAll: 'All',
  filterPlaceholder: 'Filter',
  clearSearch: 'Clear search',
  reload: 'Reload',
  loading: 'Loading',
  selectAll: 'Select all rows',
  deselectAll: 'Deselect all rows',
  selectRow: 'Select row',
  deselectRow: 'Deselect row',
  expandAllDetails: 'Show all details',
  collapseAllDetails: 'Hide all details',
  expandDetails: 'Show details',
  collapseDetails: 'Hide details',
  sortAsc: 'Sort ascending',
  sortDesc: 'Sort descending',
  calendarPrevious: 'Previous',
  calendarNext: 'Next',
  clear: 'Clear',
} as const satisfies Record<keyof Spec.Texts, string>;

function createNumberFormat(locale: string): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale);
  } catch {
    return new Intl.NumberFormat(FALLBACK_LOCALE);
  }
}

// Without an adapter: the language of the page (`<html lang>`), else en-US.
function pageLocale(): string {
  return (typeof document === 'undefined' ? '' : document.documentElement.lang) || FALLBACK_LOCALE;
}

// The locale the texts are in: the adapter's, else the page's. For formatting of our own (e.g. dates with `Intl`).
function useLocale(): string {
  const { i18n } = useContext(ConfigContext);

  return i18n?.currentLocale() ?? pageLocale();
}

// The texts come from the `I18nAdapter` of the configuration (namespace "datanav"): it gets the key, the raw params
// and the English text, already filled in, and returns the translation (or that English text). Without an adapter, the
// English texts are used. The component re-renders when the adapter reports a change of the language.
function useTexts(): Spec.Texts {
  const { i18n } = useContext(ConfigContext);
  const [version, setVersion] = useState(0);

  useEffect(() => i18n?.onChange?.(() => setVersion((current) => current + 1)), [i18n]);

  const locale = i18n?.currentLocale() ?? pageLocale();

  return useMemo(() => {
    const numbers = createNumberFormat(locale);

    const translate = (
      key: keyof typeof defaultTexts,
      params: Readonly<Record<string, number | string>> | null = null,
    ): string => {
      const defaultValue = defaultTexts[key].replace(/\{(\w+)\}/g, (_, name: string) => {
        const value = params?.[name];

        return typeof value === 'number' ? numbers.format(value) : String(value ?? '');
      });

      return i18n === undefined ? defaultValue : i18n.resolveText(NAMESPACE, key, params, defaultValue);
    };

    return {
      selectedCount: (params) => translate('selectedCount', params),
      itemRange: (params) => translate('itemRange', params),
      pageSize: translate('pageSize'),
      page: translate('page'),
      pageOf: (params) => translate('pageOf', params),
      firstPage: translate('firstPage'),
      previousPage: translate('previousPage'),
      nextPage: translate('nextPage'),
      lastPage: translate('lastPage'),
      empty: translate('empty'),
      emptySearch: translate('emptySearch'),
      searchPlaceholder: translate('searchPlaceholder'),
      clearFilter: translate('clearFilter'),
      filterAll: translate('filterAll'),
      filterPlaceholder: translate('filterPlaceholder'),
      clearSearch: translate('clearSearch'),
      reload: translate('reload'),
      loading: translate('loading'),
      selectAll: translate('selectAll'),
      deselectAll: translate('deselectAll'),
      selectRow: translate('selectRow'),
      deselectRow: translate('deselectRow'),
      expandAllDetails: translate('expandAllDetails'),
      collapseAllDetails: translate('collapseAllDetails'),
      expandDetails: translate('expandDetails'),
      collapseDetails: translate('collapseDetails'),
      sortAsc: translate('sortAsc'),
      sortDesc: translate('sortDesc'),
      calendarPrevious: translate('calendarPrevious'),
      calendarNext: translate('calendarNext'),
      clear: translate('clear'),
    };
  }, [i18n, locale, version]);
}
