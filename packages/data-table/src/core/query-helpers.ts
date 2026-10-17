import type { FilterRenames, RowPaging, RowQuery, RowSort } from '../api/query.js';

export { criteriaOf, pagingOf, sortOf };

// The page of a query as a window of rows: page 3 of 10 rows is the offset 20 and the limit 10.
function pagingOf({ page, pageSize }: RowQuery): RowPaging {
  return { offset: (page - 1) * pageSize, limit: pageSize };
}

// The sort of a query, if its key is one of `keys` (what the source can sort by); else none.
function sortOf<K extends string>({ sort }: RowQuery, keys: readonly K[]): RowSort<K> | undefined {
  const key = keys.find((candidate) => candidate === sort?.key);

  return sort === undefined || key === undefined ? undefined : { key, direction: sort.direction };
}

// A function that turns a query into the criteria of a source: the search (trimmed, left out when empty) under the key
// `search` (without it, the search is left out), every filter under its key, or under the one `filters` gives it. The
// values are taken as they are: the filters' values must fit the criteria.
function criteriaOf<C>(search: keyof C & string, filters?: FilterRenames<C>): (query: RowQuery) => C;
function criteriaOf<C>(filters?: FilterRenames<C>): (query: RowQuery) => C;
function criteriaOf<C>(
  first?: (keyof C & string) | FilterRenames<C>,
  second?: FilterRenames<C>,
): (query: RowQuery) => C {
  const search = typeof first === 'string' ? first : undefined;
  const renames = (typeof first === 'string' ? second : first) ?? {};

  return (query) => {
    const criteria: Record<string, unknown> = {};
    const text = query.search.trim();

    if (search !== undefined && text !== '') {
      criteria[search] = text;
    }

    for (const [key, value] of Object.entries(query.filters)) {
      criteria[renames[key] ?? key] = value;
    }

    return criteria as C;
  };
}
