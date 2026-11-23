import { inDateRange, localPage, localSource, matchesText, oneOf } from './core/local-page.js';
import { criteriaOf, pagingOf, sortOf } from './core/query-helpers.js';
import { generalAction, groupAction, multiRowAction, singleRowAction } from './element/action-builders.js';
import { defineActions, defineColumns, defineFilters } from './element/definitions.js';
import { dateColumnEditor, selectColumnEditor, textColumnEditor } from './element/editors.js';
import {
  autocompleteFilter,
  booleanFilter,
  dateRangeFilter,
  numberRangeFilter,
  selectFilter,
  textFilter,
} from './element/filters.js';
import { setupDataTable } from './element/setup-data-table.js';

export type * from './api/index.js';
export {
  autocompleteFilter,
  booleanFilter,
  criteriaOf,
  dateColumnEditor,
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  generalAction,
  groupAction,
  inDateRange,
  localPage,
  localSource,
  matchesText,
  multiRowAction,
  numberRangeFilter,
  oneOf,
  pagingOf,
  selectColumnEditor,
  selectFilter,
  setupDataTable,
  singleRowAction,
  sortOf,
  textColumnEditor,
  textFilter,
};

// The main entry, `@local/data-table`: the custom element. React is bundled into its build, so an app needs none.
// React apps use `@local/data-table/react` instead.
