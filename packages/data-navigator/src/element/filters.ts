import type { DataNavigator } from '../api';
import * as reactFilters from '../core/view/ColumnFilters';
import type { DataNavigatorComponent } from '../react/api';

export { dateRangeColumnFilter, reactFilterOf, selectColumnFilter, textColumnFilter };

// The built-in filters of the element: opaque values for the app, and each one stands for a filter of the React
// component, which renders it.
const builtIns = new WeakMap<object, DataNavigatorComponent.ColumnFilter>();

function builtIn(filter: DataNavigatorComponent.ColumnFilter): DataNavigator.BuiltInColumnFilter {
  const marker = Object.freeze({});

  builtIns.set(marker, filter);

  // The type brand exists only for the compiler: the marker is the key of the filter it stands for.
  return marker as DataNavigator.BuiltInColumnFilter;
}

// The React filter of a built-in one, or undefined for anything else (e.g. an app's own filter function).
function reactFilterOf(filter: unknown): DataNavigatorComponent.ColumnFilter | undefined {
  return typeof filter === 'object' && filter !== null ? builtIns.get(filter) : undefined;
}

// The same built-in filters as in React (see ColumnFilters.tsx), with the same settings.
function textColumnFilter(settings: DataNavigator.TextColumnFilterSettings = {}): DataNavigator.BuiltInColumnFilter {
  return builtIn(reactFilters.textColumnFilter(settings));
}

function selectColumnFilter(settings: DataNavigator.SelectColumnFilterSettings): DataNavigator.BuiltInColumnFilter {
  return builtIn(reactFilters.selectColumnFilter(settings));
}

function dateRangeColumnFilter(): DataNavigator.BuiltInColumnFilter {
  return builtIn(reactFilters.dateRangeColumnFilter());
}
