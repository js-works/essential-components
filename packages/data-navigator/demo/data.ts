import type { DataNavigatorComponent } from '../src/react';

export { countries, createUser, fetchNothing, fetchUsers, fetchUsersByCountry, LOADING_TIME, newUser, roles, saveUser };
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
  logins: number;
  active: boolean;
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
      // From the index alone too (like the date of birth), so the other values stay the same.
      logins: (index * 53) % 500,
      active: index % 3 !== 0,
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

// Kept in memory: a saved user (row editing) replaces the one with its id.
const users: User[] = [...createUsers(245)];

const SAVE_TIME = 500;

// A user as the server takes it (edited or new): the texts trimmed. A name must not be empty, and an email needs an
// "@": else the save fails, with a message the table shows in the edit form.
async function checked(draft: User): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, SAVE_TIME));

  const user = {
    ...draft,
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    email: draft.email.trim(),
  };

  if (user.firstName === '' || user.lastName === '') {
    throw new Error('The first and the last name must not be empty.');
  }

  if (!user.email.includes('@')) {
    throw new Error('The email address needs an "@".');
  }

  return user;
}

// Saves a user edited in the table (`saveRow`).
async function saveUser(draft: User): Promise<User> {
  const saved = await checked(draft);
  const index = users.findIndex((user) => user.id === saved.id);

  if (index !== -1) {
    users[index] = saved;
  }

  return saved;
}

// The template of a new user (`addRow`): its id comes with the save.
function newUser(): User {
  return {
    id: 0,
    firstName: '',
    lastName: '',
    email: '',
    role: 'Viewer',
    city: '',
    country: countries[0] ?? '',
    created: new Date().toISOString().slice(0, 10),
    dateOfBirth: '',
    logins: 0,
    active: true,
    notes: '',
  };
}

// Creates a user added in the table (`createRow`), with the next free id.
async function createUser(draft: User): Promise<User> {
  const created = { ...(await checked(draft)), id: Math.max(...users.map((user) => user.id)) + 1 };

  users.push(created);

  return created;
}

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

  const found = findUsers(query);
  const { page, pageSize } = query;

  return { rows: found.slice((page - 1) * pageSize, page * pageSize), total: found.length };
}

// The source of the "Row grouping" tab: the users grouped by country. The rows come sorted by country first (the
// table groups consecutive rows), then by the sort of the query, and with the total of every group on the page.
async function fetchUsersByCountry(
  query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<User>> {
  await wait(signal);

  // A stable sort: within a country, the order of the query's sort stays.
  const found = [...findUsers(query)].sort((a, b) => a.country.localeCompare(b.country));
  const { page, pageSize } = query;
  const rows = found.slice((page - 1) * pageSize, page * pageSize);
  const groups = [...new Set(rows.map((user) => user.country))].map((country) => ({
    key: country,
    total: found.filter((user) => user.country === country).length,
  }));

  return { rows, total: found.length, groups };
}

// The users that match the search and the filters of the query, sorted by its sort (all of them, not paged).
function findUsers(query: DataNavigatorComponent.Query): readonly User[] {
  const { sort } = query;
  const text = query.search.toLowerCase();
  const { firstName, lastName, email, role, country, dateOfBirth, logins, active } = query.filters;
  // A text filter is `{ text, match }`: contains, starts with or ends with, ignoring the case.
  const matches = (value: string, filter: unknown) => {
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
  };
  // A date range filter is `{ from, to }` (yyyy-mm-dd), a number range filter `{ from?, to? }`, both inclusive. ISO
  // dates compare as strings.
  const boundsOf = (filter: unknown): { from?: unknown; to?: unknown } =>
    filter === null || typeof filter !== 'object' || Array.isArray(filter)
      ? {}
      : (filter as { from?: unknown; to?: unknown });
  const within = (value: string, filter: unknown) => {
    const { from, to } = boundsOf(filter);

    return (typeof from !== 'string' || value >= from) && (typeof to !== 'string' || value <= to);
  };
  const withinNumbers = (value: number, filter: unknown) => {
    const { from, to } = boundsOf(filter);

    return (typeof from !== 'number' || value >= from) && (typeof to !== 'number' || value <= to);
  };
  const sorted = users
    .filter(
      (user) =>
        matches(user.firstName, firstName) && matches(user.lastName, lastName) && matches(user.email, email)
        && (typeof role !== 'string' || user.role === role)
        && (!Array.isArray(country) || country.includes(user.country))
        && within(user.dateOfBirth, dateOfBirth)
        && withinNumbers(user.logins, logins)
        && (typeof active !== 'boolean' || user.active === active),
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

  return sorted;
}

async function fetchNothing(
  _query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<User>> {
  await wait(signal);

  return { rows: [], total: 0 };
}
