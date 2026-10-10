import type { DataTable } from '../api';
import * as reactFilters from '../core/view/ColumnFilters';
import type { DataTableComponent } from '../react/api';
import { contentRendererOf, nodeContent } from './content';

export {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  reactFilterOf,
  selectColumnFilter,
  textColumnFilter,
};

// The built-in filters of the element: opaque values for the app, and each one stands for a filter of the React
// component, which renders it.
const builtIns = new WeakMap<object, DataTableComponent.ColumnFilter>();

function builtIn(filter: DataTableComponent.ColumnFilter): DataTable.BuiltInColumnFilter {
  const marker = Object.freeze({});

  builtIns.set(marker, filter);

  // The type brand exists only for the compiler: the marker is the key of the filter it stands for.
  return marker as DataTable.BuiltInColumnFilter;
}

// The React filter of a built-in one, or undefined for anything else (e.g. an app's own filter function).
function reactFilterOf(filter: unknown): DataTableComponent.ColumnFilter | undefined {
  return typeof filter === 'object' && filter !== null ? builtIns.get(filter) : undefined;
}

// The same built-in filters as in React (see ColumnFilters.tsx), with the same settings.
function textColumnFilter(settings: DataTable.TextColumnFilterSettings = {}): DataTable.BuiltInColumnFilter {
  return builtIn(reactFilters.textColumnFilter(settings));
}

function selectColumnFilter(settings: DataTable.SelectColumnFilterSettings): DataTable.BuiltInColumnFilter {
  return builtIn(reactFilters.selectColumnFilter(settings));
}

// The `content` of an option (a string or a DOM node) is rendered like the default content adapter does, whatever the
// adapter of the setup: so it works with every setup.
const renderNode = contentRendererOf(nodeContent as DataTable.ContentAdapter<unknown>);

function autocompleteColumnFilter(
  settings: DataTable.AutocompleteColumnFilterSettings,
): DataTable.BuiltInColumnFilter {
  const { load, ...rest } = settings;

  return builtIn(reactFilters.autocompleteColumnFilter({
    ...rest,
    load: async (query, signal) =>
      (await load(query, signal)).map(({ content, ...option }) =>
        content === undefined ? option : { ...option, content: () => renderNode(content) }
      ),
  }));
}

function dateRangeColumnFilter(): DataTable.BuiltInColumnFilter {
  return builtIn(reactFilters.dateRangeColumnFilter());
}

function numberRangeColumnFilter(): DataTable.BuiltInColumnFilter {
  return builtIn(reactFilters.numberRangeColumnFilter());
}

function booleanColumnFilter(): DataTable.BuiltInColumnFilter {
  return builtIn(reactFilters.booleanColumnFilter());
}
