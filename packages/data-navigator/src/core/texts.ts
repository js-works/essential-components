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
  itemRange: '{from}-{to} of {total}',
  itemSingle: '{item} of {total}',
  pageSize: 'Page Size',
  perPage: '{count} items per page',
  pageOf: '{page} of {pages}',
  goToPage: 'Page {page}',
  previousPage: 'Previous page',
  nextPage: 'Next page',
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
  filters: 'Filters',
  activeFilters: '{count} active',
  resetFilters: 'Reset',
  applyFilters: 'Apply filters',
  cancelFilters: 'Cancel',
  clearAllFilters: 'Clear all',
  removeFilter: 'Remove filter',
  emptyFilters: 'No rows match these filters',
  clearFilters: 'Clear filters',
  textMatch: 'Match',
  textContains: 'contains',
  textStartsWith: 'starts with',
  textEndsWith: 'ends with',
  rangeFrom: 'From',
  rangeTo: 'To',
  filterYes: 'Yes',
  filterNo: 'No',
  typeToSearch: 'Type to search',
  loadFailed: 'Could not load',
  removeValue: 'Remove {label}',
  clearSelection: 'Clear selection',
  columns: 'Columns',
  resetColumnWidths: 'Reset column widths',
  optimizeColumnWidths: 'Optimize column widths',
  layout: 'Layout',
  layoutAuto: 'Automatic',
  layoutTable: 'Table',
  layoutCards: 'Cards',
  moveRow: 'Move row',
  emptyGroup: '(Blank)',
  movedTo: 'Moved to position {position}',
  expandGroup: 'Show group',
  collapseGroup: 'Hide group',
  selectGroup: 'Select group',
  deselectGroup: 'Deselect group',
  groupCount: '{count}',
  groupPartial: '{shown} of {total}',
  confirmEdit: 'OK',
  confirmNew: 'Add',
  cancelEdit: 'Cancel',
  saveFailed: 'The row could not be saved',
  editRow: 'Edit row',
  newRow: 'New row',
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
      itemSingle: (params) => translate('itemSingle', params),
      pageSize: translate('pageSize'),
      perPage: (params) => translate('perPage', params),
      pageOf: (params) => translate('pageOf', params),
      goToPage: (params) => translate('goToPage', params),
      previousPage: translate('previousPage'),
      nextPage: translate('nextPage'),
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
      filters: translate('filters'),
      activeFilters: (params) => translate('activeFilters', params),
      resetFilters: translate('resetFilters'),
      applyFilters: translate('applyFilters'),
      cancelFilters: translate('cancelFilters'),
      clearAllFilters: translate('clearAllFilters'),
      removeFilter: translate('removeFilter'),
      emptyFilters: translate('emptyFilters'),
      clearFilters: translate('clearFilters'),
      textMatch: translate('textMatch'),
      textContains: translate('textContains'),
      textStartsWith: translate('textStartsWith'),
      textEndsWith: translate('textEndsWith'),
      rangeFrom: translate('rangeFrom'),
      rangeTo: translate('rangeTo'),
      filterYes: translate('filterYes'),
      filterNo: translate('filterNo'),
      typeToSearch: translate('typeToSearch'),
      loadFailed: translate('loadFailed'),
      removeValue: (params) => translate('removeValue', params),
      clearSelection: translate('clearSelection'),
      columns: translate('columns'),
      resetColumnWidths: translate('resetColumnWidths'),
      optimizeColumnWidths: translate('optimizeColumnWidths'),
      layout: translate('layout'),
      layoutAuto: translate('layoutAuto'),
      layoutTable: translate('layoutTable'),
      layoutCards: translate('layoutCards'),
      moveRow: translate('moveRow'),
      emptyGroup: translate('emptyGroup'),
      movedTo: (params) => translate('movedTo', params),
      expandGroup: translate('expandGroup'),
      collapseGroup: translate('collapseGroup'),
      selectGroup: translate('selectGroup'),
      deselectGroup: translate('deselectGroup'),
      groupCount: (params) => translate('groupCount', params),
      groupPartial: (params) => translate('groupPartial', params),
      confirmEdit: translate('confirmEdit'),
      confirmNew: translate('confirmNew'),
      cancelEdit: translate('cancelEdit'),
      saveFailed: translate('saveFailed'),
      editRow: translate('editRow'),
      newRow: translate('newRow'),
    };
  }, [i18n, locale, version]);
}
