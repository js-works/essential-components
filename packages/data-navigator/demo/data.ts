import type { DataNavigatorComponent } from '../src/react';

export { countries, fetchNothing, fetchUsers, LOADING_TIME, roles };
export type { User };

type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  city: string;
  country: string;
  created: string;
  // yyyy-mm-dd
  dateOfBirth: string;
  notes: string;
};

const LOADING_TIME = 1000;

const firstNames = [
  'Ada',
  'Alan',
  'Grace',
  'Linus',
  'Margaret',
  'Dennis',
  'Barbara',
  'Ken',
  'Hedy',
  'Tim',
  'Radia',
  'Guido',
];
const lastNames = [
  'Lovelace',
  'Turing',
  'Hopper',
  'Torvalds',
  'Hamilton',
  'Ritchie',
  'Liskov',
  'Thompson',
  'Lamarr',
  'Berners-Lee',
];
const places = [
  ['Vienna', 'Austria'],
  ['Berlin', 'Germany'],
  ['Zurich', 'Switzerland'],
  ['Paris', 'France'],
  ['Madrid', 'Spain'],
  ['Oslo', 'Norway'],
  ['Lisbon', 'Portugal'],
] as const;
const roles = ['Admin', 'Editor', 'Viewer'] as const;
const countries = [...new Set(places.map(([, country]) => country))].sort();

function createUsers(count: number): readonly User[] {
  let seed = 42;

  const next = (limit: number): number => {
    seed = (seed * 1103515245 + 12345) % 2147483648;

    return seed % limit;
  };

  return Array.from({ length: count }, (_, index) => {
    const firstName = firstNames[next(firstNames.length)] ?? '';
    const lastName = lastNames[next(lastNames.length)] ?? '';
    const [city, country] = places[next(places.length)] ?? ['', ''];
    const created = new Date(Date.UTC(2020 + next(6), next(12), 1 + next(28)));

    return {
      id: index + 1,
      firstName,
      lastName,
      email: `${firstName}.${lastName}${index + 1}@example.com`.toLowerCase(),
      role: roles[next(roles.length)] ?? 'Viewer',
      city,
      country,
      created: created.toISOString().slice(0, 10),
      dateOfBirth: dateOfBirthOf(index),
      notes: `${firstName} ${lastName} works in ${city}. Account #${index + 1}.`,
    };
  });
}

// A date of birth between 1950 and 2004, from the index alone: not from the random numbers above, which would shift
// every other value of the demo data.
function dateOfBirthOf(index: number): string {
  const date = new Date(Date.UTC(1950 + (index * 37) % 55, (index * 7) % 12, 1 + (index * 13) % 28));

  return date.toISOString().slice(0, 10);
}

const users = createUsers(245);

function compare(a: unknown, b: unknown): number {
  return typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b));
}

// The simulated loading time. Like a fetch, it rejects as soon as the signal is aborted.
function wait(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, LOADING_TIME);

    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

async function fetchUsers(
  query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<User>> {
  await wait(signal);

  const { sort, page, pageSize } = query;
  const text = query.search.toLowerCase();
  const { firstName, lastName, email, role, country, dateOfBirth } = query.filters;
  const contains = (value: string, filter: unknown) =>
    typeof filter !== 'string' || value.toLowerCase().includes(filter.toLowerCase());
  // A date range filter is `{ from, to }` (yyyy-mm-dd, both inclusive): ISO dates compare as strings.
  const within = (value: string, filter: unknown) => {
    if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
      return true;
    }

    const { from, to } = filter as { from?: unknown; to?: unknown };

    return (typeof from !== 'string' || value >= from) && (typeof to !== 'string' || value <= to);
  };
  const sorted = users
    .filter(
      (user) =>
        contains(user.firstName, firstName) && contains(user.lastName, lastName) && contains(user.email, email)
        && (typeof role !== 'string' || user.role === role)
        && (!Array.isArray(country) || country.includes(user.country))
        && within(user.dateOfBirth, dateOfBirth),
    )
    .filter(
      (user) =>
        text === ''
        || [user.firstName, user.lastName, user.email, user.city, user.country, user.role].some((value) =>
          value.toLowerCase().includes(text)
        ),
    );

  if (sort) {
    const key = sort.key as keyof User;
    const factor = sort.direction === 'asc' ? 1 : -1;

    sorted.sort((a, b) => factor * compare(a[key], b[key]));
  }

  return { rows: sorted.slice((page - 1) * pageSize, page * pageSize), total: sorted.length };
}

async function fetchNothing(
  _query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<User>> {
  await wait(signal);

  return { rows: [], total: 0 };
}
