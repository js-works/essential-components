import type { LocalPageOptions } from '../api/local-page.js';
import type { RowPage, RowQuery, RowSource } from '../api/query.js';

export { inDateRange, localPage, localSource, matchesText, oneOf };

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
function inDateRange(date: string, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { from, to } = filter as { from?: unknown; to?: unknown };
  const day = date.slice(0, 10);

  return (typeof from !== 'string' || day >= from) && (typeof to !== 'string' || day <= to);
}

// A filter without a predicate of its own: the row's field of the filter's key, matched by the shape of the filter's
// value (the built-in filters'): a list, one of them; `{ text, match }`, the text match; `{ from, to }`, a range (of
// numbers for a number, else of days); anything else (a boolean, a single select's value), equal. A row without that
// field passes (the filter is about something else).
function matchesField<Row>(row: Row, key: string, value: unknown): boolean {
  if (row === null || typeof row !== 'object' || !(key in row)) {
    return true;
  }

  const field = (row as Record<string, unknown>)[key];

  if (Array.isArray(value)) {
    return value.length === 0 || value.includes(field);
  }

  if (value !== null && typeof value === 'object') {
    if ('text' in value) {
      return matchesText(String(field ?? ''), value);
    }

    if (typeof field === 'number') {
      const { from, to } = value as { from?: unknown; to?: unknown };

      return (typeof from !== 'number' || field >= from) && (typeof to !== 'number' || field <= to);
    }

    return inDateRange(String(field ?? ''), value);
  }

  return field === value;
}

// A page of rows that are all in memory already (small lists), as a source gives it: the rows that pass every filter
// (`filters`: a predicate per filter key, called with the filter's value; else `matchesField`) and contain the search
// in one of the fields of `search`, sorted by the query's sort (by the row's field of the sort key, or by `sortValue`;
// numbers as numbers, texts in a natural order), the query's page of them, and their number.
function localPage<Row>(rows: readonly Row[], query: RowQuery, options: LocalPageOptions<Row>): RowPage<Row> {
  const text = query.search.trim().toLowerCase();
  const filtered = rows
    .filter((row) =>
      Object.entries(query.filters).every(([key, value]) => {
        const predicate = options.filters?.[key];

        return predicate === undefined ? matchesField(row, key, value) : predicate(row, value);
      })
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

// A source over a fixed array (small lists): each page by `localPage`. The table does not load again for other rows
// (a new source): give it a `key` of them, or reload it.
function localSource<Row>(rows: readonly Row[], options: LocalPageOptions<Row>): RowSource<Row> {
  return async (query) => localPage(rows, query, options);
}
