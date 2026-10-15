import { createContext, useContext } from 'react';

export { ColumnLabelsContext, FilterLabelsContext, useColumnLabels, useLabelsOfColumn };
export type { FilterLabels };

// The labels of the values chosen in the filters of one table (an autocomplete's options), by column key, then by
// value. The table keeps them, not the filter: a filter made anew on every render keeps its pill texts.
type FilterLabels = Map<string, Map<string, string>>;

// The labels of the whole table, provided by its view.
const FilterLabelsContext = createContext<FilterLabels>(new Map());

// The labels of the column whose filter is rendered.
const ColumnLabelsContext = createContext<Map<string, string>>(new Map());

// The labels of a column of the table (created on first use).
function useLabelsOfColumn(): (key: string) => Map<string, string> {
  const all = useContext(FilterLabelsContext);

  return (key) => {
    const labels = all.get(key) ?? new Map<string, string>();

    all.set(key, labels);

    return labels;
  };
}

function useColumnLabels(): Map<string, string> {
  return useContext(ColumnLabelsContext);
}
