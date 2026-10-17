import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { FoundPage } from '../api/find.js';
import type { RowPaging, RowSort, TableColumns } from '../api/react/index.js';
import { criteriaOf } from '../core/query-helpers.js';
import { createDataTableComponent } from '../react/create-data-table-component.js';
import { useFindSource } from './use-find-source.js';

const Table = createDataTableComponent();

type Person = { id: number; name: string };
type Criteria = { text?: string };

const people: readonly Person[] = Array.from(
  { length: 30 },
  (_, index) => ({ id: index + 1, name: `Person ${index + 1}` }),
);

const columns: TableColumns<Person> = [{ key: 'name', header: 'Name', sortable: true }];

function createFind() {
  return vi.fn(
    async (_criteria: Criteria, _sort: RowSort<'name'> | undefined, paging: RowPaging): Promise<FoundPage<Person>> => ({
      items: people.slice(paging.offset, paging.offset + paging.limit),
      total: people.length,
    }),
  );
}

function People({ find }: { find: ReturnType<typeof createFind> }) {
  const source = useFindSource(['people'], ['name'], criteriaOf<Criteria>('text'), find);

  return (
    <Table
      source={source}
      rowKey="id"
      columns={columns}
      pageSize={10}
      defaultSort={{ key: 'name', direction: 'desc' }}
    />
  );
}

afterEach(cleanup);

describe('useFindSource', () => {
  it('asks the find with the criteria, the sort and the window, and reloads when its scope is invalidated', async () => {
    const queryClient = new QueryClient();
    const find = createFind();

    render(
      <QueryClientProvider client={queryClient}>
        <People find={find} />
      </QueryClientProvider>,
    );
    await waitFor(() => expect(screen.getByText('Person 1')).toBeTruthy());

    expect(find.mock.calls[0]?.slice(0, 3)).toEqual([{}, { key: 'name', direction: 'desc' }, { offset: 0, limit: 10 }]);

    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['people'] });
    });

    await waitFor(() => expect(find).toHaveBeenCalledTimes(2));
  });
});
