export type { Page, Paging, Range, Sort };

// The generic building blocks of the repositories' queries (no entity).

// Both ends inclusive; a missing end is open.
type Range<T> = { from?: T; to?: T };

type Sort<K extends string> = { key: K; direction: 'asc' | 'desc' };

// A window of the results: skip `offset`, take at most `limit`.
type Paging = { offset: number; limit: number };

// The results in the window, and how many there are in all.
type Page<T> = { items: readonly T[]; total: number };
