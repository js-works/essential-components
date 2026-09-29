import type { DataNavigator } from './api';
import {
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
} from './element/filters';
import { setupDataNavigator } from './element/setupDataNavigator';

export {
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  setupDataNavigator,
  textColumnFilter,
};
export type { DataNavigator };

// The main entry, `@local/data-navigator`: the custom element. React is bundled into its build, so an app needs none.
// React apps use `@local/data-navigator/react` instead.
