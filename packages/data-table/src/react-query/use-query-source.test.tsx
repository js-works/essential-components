import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { RowPage, RowQuery, TableColumns } from '../api/react/index.js';
import { createDataTableComponent } from '../react/create-data-table-component.js';
import { useQuerySource } from './use-query-source.js';

const Table = createDataTableComponent();

type Person = { id: number; name: string };

const people: readonly Person[] = Array.from(
  { length: 30 },
  (_, index) => ({ id: index + 1, name: `Person ${index + 1}` }),
);

const columns: TableColumns<Person> = [{ key: 'name', header: 'Name' }];

function createFetch() {
  return vi.fn(async (query: RowQuery): Promise<RowPage<Person>> => ({
    rows: people.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
    total: people.length,
  }));
}

function People({ fetch }: { fetch: ReturnType<typeof createFetch> }) {
  const source = useQuerySource((query) => ['people', 'page', query], fetch, ['people']);

  return <Table source={source} rowKey="id" columns={columns} pageSize={10} />;
}

function renderWith(queryClient: QueryClient, fetch: ReturnType<typeof createFetch>) {
  return render(
    <QueryClientProvider client={queryClient}>
      <People fetch={fetch} />
    </QueryClientProvider>,
  );
}

afterEach(cleanup);

describe('useQuerySource', () => {
  it('loads the pages through the query client, cached under their keys', async () => {
    const queryClient = new QueryClient();
    const fetch = createFetch();
    const { unmount } = renderWith(queryClient, fetch);

    await waitFor(() => expect(screen.getByText('Person 1')).toBeTruthy());
    unmount();

    // A table of the same pages, mounted again: the page comes from the cache (it is fresh for 30 seconds).
    renderWith(queryClient, fetch);
    await waitFor(() => expect(screen.getByText('Person 1')).toBeTruthy());

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(queryClient.getQueryData(['people', 'page', fetch.mock.calls[0]![0]])).toBeTruthy();
  });

  it('reloads the table when a query under `watch` is invalidated, once for all of them', async () => {
    const queryClient = new QueryClient();
    const fetch = createFetch();

    queryClient.setQueryData(['people', 'count'], 30);
    renderWith(queryClient, fetch);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['people'] });
    });

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('does not reload for a change of other data', async () => {
    const queryClient = new QueryClient();
    const fetch = createFetch();

    queryClient.setQueryData(['boards'], []);
    renderWith(queryClient, fetch);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['boards'] });
    });

    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
