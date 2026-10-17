import { describe, expect, it } from 'vitest';

import type { RowQuery } from '../api/query.js';
import { criteriaOf, pagingOf, sortOf } from './query-helpers.js';

const query = (changes: Partial<RowQuery> = {}): RowQuery => ({
  page: 1,
  pageSize: 10,
  search: '',
  filters: {},
  ...changes,
});

describe('pagingOf', () => {
  it('gives the page as a window of rows', () => {
    expect(pagingOf(query())).toEqual({ offset: 0, limit: 10 });
    expect(pagingOf(query({ page: 3, pageSize: 25 }))).toEqual({ offset: 50, limit: 25 });
  });
});

describe('sortOf', () => {
  const keys = ['name', 'since'] as const;

  it('gives the sort when its key is one of the keys', () => {
    expect(sortOf(query({ sort: { key: 'since', direction: 'desc' } }), keys)).toEqual({
      key: 'since',
      direction: 'desc',
    });
  });

  it('gives none for another key, and without a sort', () => {
    expect(sortOf(query({ sort: { key: 'email', direction: 'asc' } }), keys)).toBeUndefined();
    expect(sortOf(query(), keys)).toBeUndefined();
  });
});

describe('criteriaOf', () => {
  type Criteria = { text?: string; names?: readonly string[]; since?: { from: string; to: string } };

  it('puts the search and the filters under the keys of the criteria', () => {
    const toCriteria = criteriaOf<Criteria>('text', { name: 'names' });
    const since = { from: '2026-01-01', to: '2026-12-31' };

    expect(toCriteria(query({ search: ' ann ', filters: { name: ['Ann', 'Bob'], since } }))).toEqual({
      text: 'ann',
      names: ['Ann', 'Bob'],
      since,
    });
  });

  it('leaves out an empty search, and the search without a key for it', () => {
    expect(criteriaOf<Criteria>('text')(query({ search: '  ' }))).toEqual({});
    expect(criteriaOf<Criteria>()(query({ search: 'ann' }))).toEqual({});
    expect(criteriaOf<Criteria>({ name: 'names' })(query({ search: 'ann', filters: { name: ['Ann'] } }))).toEqual({
      names: ['Ann'],
    });
  });

  it('checks the keys it maps to', () => {
    // @ts-expect-error: `nmaes` is no key of the criteria.
    criteriaOf<Criteria>({ name: 'nmaes' });
    // @ts-expect-error: `txt` is no key of the criteria.
    criteriaOf<Criteria>('txt');
  });
});
