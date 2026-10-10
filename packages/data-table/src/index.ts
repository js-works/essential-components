import type { DataTable } from './api';
import { dateColumnEditor, selectColumnEditor, textColumnEditor } from './element/editors';
import {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
} from './element/filters';
import { setupDataTable } from './element/setupDataTable';

export {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateColumnEditor,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnEditor,
  selectColumnFilter,
  setupDataTable,
  textColumnEditor,
  textColumnFilter,
};
export type { DataTable };

// The main entry, `@local/data-table`: the custom element. React is bundled into its build, so an app needs none.
// React apps use `@local/data-table/react` instead.
