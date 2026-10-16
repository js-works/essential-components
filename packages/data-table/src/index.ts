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

export {
  autocompleteFilter,
  booleanFilter,
  dateColumnEditor,
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  generalAction,
  groupAction,
  multiRowAction,
  numberRangeFilter,
  selectColumnEditor,
  selectFilter,
  setupDataTable,
  singleRowAction,
  textColumnEditor,
  textFilter,
};

export type * from './api/index.js';

// The main entry, `@local/data-table`: the custom element. React is bundled into its build, so an app needs none.
// React apps use `@local/data-table/react` instead.
