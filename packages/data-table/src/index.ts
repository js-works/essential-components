import { dateColumnEditor, selectColumnEditor, textColumnEditor } from './element/editors.js';
import {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
} from './element/filters.js';
import { setupDataTable } from './element/setupDataTable.js';

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
export type * from './api/index.js';

// The main entry, `@local/data-table`: the custom element. React is bundled into its build, so an app needs none.
// React apps use `@local/data-table/react` instead.
