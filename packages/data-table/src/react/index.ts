import { useDataTableController, useDataTableSelection } from '../core/controllerHooks';
import { dateColumnEditor, selectColumnEditor, textColumnEditor } from '../core/view/ColumnEditors';
import {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
} from '../core/view/ColumnFilters';
import type { DataTableComponent } from './api';
import { createDataTableComponent } from './createDataTableComponent';

export {
  autocompleteColumnFilter,
  booleanColumnFilter,
  createDataTableComponent,
  dateColumnEditor,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnEditor,
  selectColumnFilter,
  textColumnEditor,
  textColumnFilter,
  useDataTableController,
  useDataTableSelection,
};
export type { DataTableComponent };

// The React entry, `@local/data-table/react`: everything a React app needs (with the app's React). The themes come
// from `@local/data-table/themes`.
