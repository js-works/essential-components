import { describe, expect, it } from 'vitest';

import type { RowQuery } from '../api/query.js';
import { inDateRange, localPage, localSource, matchesText, oneOf } from './local-page.js';

type Person = { id: number; name: string; city: string; born: string; logins: number };

const people: readonly Person[] = [
  { id: 1, name: 'Anna', city: 'Vienna', born: '1990-05-01', logins: 12 },
  { id: 2, name: 'Bob', city: 'Berlin', born: '1985-01-20', logins: 3 },
  { id: 3, name: 'Carla', city: 'Vienna', born: '2001-11-11', logins: 40 },
  { id: 4, name: 'Dan', city: 'Graz', born: '1979-07-07', logins: 9 },
];

const query = (changes: Partial<RowQuery> = {}): RowQuery => ({
  page: 1,
  pageSize: 10,
  search: '',
  filters: {},
  ...changes,
});

const names = (rows: readonly Person[]) => rows.map((person) => person.name);

describe('localPage', () => {
  const options = {
    search: ['name', 'city'] as const,
    filters: {
      city: (person: Person, value: unknown) => oneOf(person.city, value),
      born: (person: Person, value: unknown) => inDateRange(person.born, value),
    },
  };

  it('searches the fields of `search`, ignoring the case', () => {
    expect(names(localPage(people, query({ search: ' VIE ' }), options).rows)).toEqual(['Anna', 'Carla']);
  });

  it('applies every filter with its predicate', () => {
    const page = localPage(
      people,
      query({ filters: { city: ['Vienna', 'Graz'], born: { from: '1980-01-01' } } }),
      options,
    );

    expect(names(page.rows)).toEqual(['Anna', 'Carla']);
    expect(page.total).toBe(2);
  });

  it('sorts numbers as numbers and texts in a natural order, by the field or by `sortValue`', () => {
    const byLogins = localPage(people, query({ sort: { key: 'logins', direction: 'desc' } }), options);
    const byLength = localPage(people, query({ sort: { key: 'length', direction: 'asc' } }), {
      ...options,
      sortValue: { length: (person) => person.name.length },
    });

    expect(names(byLogins.rows)).toEqual(['Carla', 'Anna', 'Dan', 'Bob']);
    expect(names(byLength.rows)).toEqual(['Bob', 'Dan', 'Anna', 'Carla']);
  });

  it('gives the page of the query, and the number of all the rows found', () => {
    const page = localPage(people, query({ page: 2, pageSize: 3 }), options);

    expect(names(page.rows)).toEqual(['Dan']);
    expect(page.total).toBe(4);
  });
});

describe('localPage without a predicate', () => {
  type Task = { id: number; title: string; tags: string; status: string; done: boolean; points: number; due: string };

  const tasks: readonly Task[] = [
    { id: 1, title: 'Write docs', tags: 'a', status: 'open', done: false, points: 3, due: '2026-10-20' },
    { id: 2, title: 'Fix bug', tags: 'b', status: 'closed', done: true, points: 8, due: '2026-10-01' },
    { id: 3, title: 'Review', tags: 'a', status: 'open', done: false, points: 1, due: '2026-11-05T10:00' },
  ];
  const ids = (filters: RowQuery['filters']) =>
    localPage(tasks, query({ filters }), { search: ['title'] }).rows.map((task) => task.id);

  it('matches the row\'s field of the filter\'s key by the shape of the value', () => {
    expect(ids({ status: ['closed'] })).toEqual([2]);
    expect(ids({ title: { text: 're', match: 'startsWith' } })).toEqual([3]);
    expect(ids({ points: { from: 2, to: 5 } })).toEqual([1]);
    expect(ids({ due: { from: '2026-10-15' } })).toEqual([1, 3]);
    expect(ids({ done: true })).toEqual([2]);
    expect(ids({ status: 'open' })).toEqual([1, 3]);
  });

  it('lets a row without the field pass, and a predicate win', () => {
    expect(ids({ owner: ['Ann'] })).toEqual([1, 2, 3]);
    expect(
      localPage(tasks, query({ filters: { status: ['open'] } }), {
        search: [],
        filters: { status: (task) => task.points > 2 },
      }).rows.map((task) => task.id),
    ).toEqual([1, 2]);
  });
});

describe('the matchers', () => {
  it('oneOf: one of the chosen values, all without a choice', () => {
    expect(oneOf('Vienna', ['Vienna'])).toBe(true);
    expect(oneOf('Graz', ['Vienna'])).toBe(false);
    expect(oneOf('Graz', [])).toBe(true);
  });

  it('matchesText: contains, starts with or ends with, ignoring the case', () => {
    expect(matchesText('Vienna', { text: 'ENN', match: 'contains' })).toBe(true);
    expect(matchesText('Vienna', { text: 'vi', match: 'startsWith' })).toBe(true);
    expect(matchesText('Vienna', { text: 'vi', match: 'endsWith' })).toBe(false);
  });

  it('inDateRange: a range of days, both inclusive, of a date or a date with a time', () => {
    expect(inDateRange('2026-10-17T09:30', { from: '2026-10-17', to: '2026-10-17' })).toBe(true);
    expect(inDateRange('2026-10-18', { to: '2026-10-17' })).toBe(false);
  });
});

describe('localSource', () => {
  it('gives each page of a fixed array by localPage', async () => {
    const source = localSource(people, { search: ['name'] });
    const load = typeof source === 'function' ? source : source.load;
    const page = await load(query({ search: 'a', pageSize: 2 }), new AbortController().signal);

    expect(names(page.rows)).toEqual(['Anna', 'Carla']);
    expect(page.total).toBe(3);
  });
});
