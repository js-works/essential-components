import type { DataNavigatorComponent } from '../../../../packages/data-navigator/src/react';

export { matchesText, oneOf, runLocalQuery, within };
export type { LocalQueryOptions };

// A data navigator's query over rows that are all in memory already (small lists): search, column filters, sorting,
// paging.

type LocalQueryOptions<Row> = {
  // The fields the search looks in.
  search: readonly (keyof Row & string)[];
  // One predicate per filterable column, called with the column's filter value.
  filters?: Partial<Record<string, (row: Row, value: unknown) => boolean>>;
  // The value a column sorts by, if not the row's field of its key.
  sortValue?: Partial<Record<string, (row: Row) => string | number>>;
};

// A select filter: one of the chosen values (none chosen: all).
function oneOf(value: string, filter: unknown): boolean {
  return !Array.isArray(filter) || filter.length === 0 || filter.includes(value);
}

// A text filter `{ text, match }`.
function matchesText(value: string, filter: unknown): boolean {
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

// A date range `{ from, to }` (yyyy-mm-dd, both inclusive).
function within(date: string, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { from, to } = filter as { from?: unknown; to?: unknown };
  const day = date.slice(0, 10);

  return (typeof from !== 'string' || day >= from) && (typeof to !== 'string' || day <= to);
}

function runLocalQuery<Row>(
  rows: readonly Row[],
  query: DataNavigatorComponent.Query,
  options: LocalQueryOptions<Row>,
): DataNavigatorComponent.Result<Row> {
  const text = query.search.trim().toLowerCase();
  const filtered = rows
    .filter((row) =>
      Object.entries(query.filters).every(([key, value]) => options.filters?.[key]?.(row, value) ?? true)
    )
    .filter((row) => text === '' || options.search.some((key) => String(row[key] ?? '').toLowerCase().includes(text)));

  if (query.sort) {
    const { key, direction } = query.sort;
    const valueOf = options.sortValue?.[key] ?? ((row: Row) => row[key as keyof Row] as unknown as string | number);
    const factor = direction === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      const [left, right] = [valueOf(a), valueOf(b)];

      return factor * (typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''), 'en', { numeric: true }));
    });
  }

  const { page, pageSize } = query;

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}
