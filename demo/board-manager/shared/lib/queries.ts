import type { QueryKey } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';

export { useRead, useRecord };

// A read through TanStack Query: its data, `undefined` while it loads the first time.
function useRead<T>(key: QueryKey, read: (signal: AbortSignal) => Promise<T>): T | undefined {
  return useQuery({ queryKey: key, queryFn: ({ signal }) => read(signal) }).data;
}

// One record (e.g. by its id): `undefined` when there is none, `isPending` while it loads the first time. TanStack
// Query takes no `undefined` as data: a missing record is `null` in the cache.
function useRecord<T>(
  key: QueryKey,
  read: (signal: AbortSignal) => Promise<T | undefined>,
): { record: T | undefined; isPending: boolean } {
  const { data, isPending } = useQuery({ queryKey: key, queryFn: async ({ signal }) => (await read(signal)) ?? null });

  return { record: data ?? undefined, isPending };
}
