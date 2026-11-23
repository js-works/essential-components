import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { SavedFilterStore, StoredFilter } from '../api/saved-filters.js';
import { useSavedFilters } from './use-saved-filters.js';

// A store in memory: a colleague's filter, and the user's own.
function createStore(): SavedFilterStore & { lists: number } {
  let own: StoredFilter[] = [];
  const store = {
    lists: 0,
    list: vi.fn(async (table: string) => {
      store.lists += 1;

      return [
        { id: 'c1', name: 'Theirs', filters: { city: ['Vienna'] }, shared: true, owner: 'Ann' },
        ...own.filter(() => table === 'people'),
      ];
    }),
    save: vi.fn(async (_table: string, name: string, filters: Readonly<Record<string, unknown>>, shared: boolean) => {
      own = [...own, { id: name, name, filters, shared }];
    }),
    remove: vi.fn(async (_table: string, id: string) => {
      own = own.filter((filter) => filter.id !== id);
    }),
    setShared: vi.fn(async (_table: string, id: string, shared: boolean) => {
      own = own.map((filter) => (filter.id === id ? { ...filter, shared } : filter));
    }),
  };

  return store;
}

describe('useSavedFilters', () => {
  it('loads the list of the table, and the others\' filters are not removable', async () => {
    const store = createStore();
    const { result } = renderHook(() => useSavedFilters(store, 'people'));

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    expect(result.current.items[0]).toMatchObject({ name: 'Theirs', owner: 'Ann', removable: false });
    expect(result.current.sharing).toBe(true);
  });

  it('saves, shares and removes in the store, and loads the list again after each change', async () => {
    const store = createStore();
    const { result } = renderHook(() => useSavedFilters(store, 'people'));

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    await act(() => result.current.save('Mine', { city: ['Berlin'] }, { shared: false }));
    await waitFor(() => expect(result.current.items.map((filter) => filter.name)).toEqual(['Theirs', 'Mine']));

    expect(store.save).toHaveBeenCalledWith('people', 'Mine', { city: ['Berlin'] }, false);
    expect(result.current.items[1]).toMatchObject({ shared: false, removable: true });

    await act(() => result.current.setShared?.('Mine', true));
    await waitFor(() => expect(result.current.items[1]?.shared).toBe(true));

    await act(() => result.current.remove('Mine'));
    await waitFor(() => expect(result.current.items).toHaveLength(1));
  });
});
