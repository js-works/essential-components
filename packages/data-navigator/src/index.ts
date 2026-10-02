import type { DataNavigator } from './api';
import { dateColumnEditor, selectColumnEditor, textColumnEditor } from './element/editors';
import {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
} from './element/filters';
import { setupDataNavigator } from './element/setupDataNavigator';

export {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateColumnEditor,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnEditor,
  selectColumnFilter,
  setupDataNavigator,
  textColumnEditor,
  textColumnFilter,
};
export type { DataNavigator };

// The main entry, `@local/data-navigator`: the custom element. React is bundled into its build, so an app needs none.
// React apps use `@local/data-navigator/react` instead.
