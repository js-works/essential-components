import type { DataTableComponent } from '../../../../packages/data-table/src/react';

export { matches, oneOf, runQuery, within };

// The filters of the columns: a select filter is a list (one of), a text filter `{ text, match }`, a date range
// `{ from, to }` (yyyy-mm-dd, both inclusive).
function oneOf(value: string, filter: unknown): boolean {
  return !Array.isArray(filter) || filter.length === 0 || filter.includes(value);
}

function within(date: string, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { from, to } = filter as { from?: unknown; to?: unknown };
  const day = date.slice(0, 10);

  return (typeof from !== 'string' || day >= from) && (typeof to !== 'string' || day <= to);
}

function matches(value: string, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { text, match } = filter as { text?: unknown; match?: unknown };

  if (typeof text !== 'string') {
    return true;
  }

  const [haystack, needle] = [value.toLowerCase(), text.toLowerCase()];

  return match === 'startsWith'
    ? haystack.startsWith(needle)
    : match === 'endsWith'
    ? haystack.endsWith(needle)
    : haystack.includes(needle);
}

type QueryOptions<Row> = {
  // The fields the search looks in.
  search: readonly (keyof Row & string)[];
  // One predicate per filterable column, called with the column's filter value.
  filters?: Partial<Record<string, (row: Row, value: unknown) => boolean>>;
};

// Search, column filters, sorting and paging, the same for every table.
function runQuery<Row>(
  rows: readonly Row[],
  query: DataTableComponent.Query,
  options: QueryOptions<Row>,
): DataTableComponent.Result<Row> {
  const text = query.search.toLowerCase();
  const filtered = rows
    .filter((row) =>
      Object.entries(query.filters).every(([key, value]) => options.filters?.[key]?.(row, value) ?? true)
    )
    .filter((row) => text === '' || options.search.some((key) => String(row[key] ?? '').toLowerCase().includes(text)));

  if (query.sort) {
    const key = query.sort.key as keyof Row;
    const factor = query.sort.direction === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      const [left, right] = [a[key], b[key]];

      return factor * (typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''), 'en', { numeric: true }));
    });
  }

  const { page, pageSize } = query;

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}
