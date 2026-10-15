import type * as DataTable from '../api/index.js';
import type * as DataTableComponent from '../api/react/index.js';
import * as reactFilters from '../core/view/ColumnFilters.js';
import { contentRendererOf, nodeContent } from './content.js';

export {
  autocompleteFilter,
  booleanFilter,
  dateRangeFilter,
  numberRangeFilter,
  reactFilterOf,
  selectFilter,
  textFilter,
};

// The built-in filters of the element: opaque values for the app, and each one stands for a filter of the React
// component, which renders it.
const builtIns = new WeakMap<object, DataTableComponent.TableFilter>();

function builtIn(filter: DataTableComponent.TableFilter): DataTable.BuiltInFilter {
  const marker = Object.freeze({});

  builtIns.set(marker, filter);

  // The type brand exists only for the compiler: the marker is the key of the filter it stands for.
  return marker as DataTable.BuiltInFilter;
}

// The React filter of a built-in one, or undefined for anything else (e.g. an app's own filter function).
function reactFilterOf(filter: unknown): DataTableComponent.TableFilter | undefined {
  return typeof filter === 'object' && filter !== null ? builtIns.get(filter) : undefined;
}

// The same built-in filters as in React (see ColumnFilters.tsx), with the same settings.
function textFilter(settings: DataTable.TextFilterSettings = {}): DataTable.BuiltInFilter {
  return builtIn(reactFilters.textFilter(settings));
}

function selectFilter(settings: DataTable.SelectFilterSettings): DataTable.BuiltInFilter {
  return builtIn(reactFilters.selectFilter(settings));
}

// The `content` of an option (a string or a DOM node) is rendered like the default content adapter does, whatever the
// adapter of the setup: so it works with every setup.
const renderNode = contentRendererOf(nodeContent as DataTable.ContentAdapter<unknown>);

function autocompleteFilter(
  settings: DataTable.AutocompleteFilterSettings,
): DataTable.BuiltInFilter {
  const { load, ...rest } = settings;

  return builtIn(reactFilters.autocompleteFilter({
    ...rest,
    load: async (query, signal) =>
      (await load(query, signal)).map(({ content, ...option }) =>
        content === undefined ? option : { ...option, content: () => renderNode(content) }
      ),
  }));
}

function dateRangeFilter(): DataTable.BuiltInFilter {
  return builtIn(reactFilters.dateRangeFilter());
}

function numberRangeFilter(): DataTable.BuiltInFilter {
  return builtIn(reactFilters.numberRangeFilter());
}

function booleanFilter(): DataTable.BuiltInFilter {
  return builtIn(reactFilters.booleanFilter());
}
