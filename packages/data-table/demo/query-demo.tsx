import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type { RowPaging, RowSort } from '../src/react/index.js';
import { createDataTableComponent, criteriaOf, defineColumns } from '../src/react/index.js';
import type { FoundPage } from '../src/react-query/index.js';
import { useFindSource } from '../src/react-query/index.js';
import { defaultTheme } from '../src/themes/index.js';
import type { User } from './data.js';
import { fetchUsers } from './data.js';
import { note } from './demo.module.css';
import { i18n } from './i18n.js';

export { QueryDemo };

const DataTable = createDataTableComponent({ i18n, theme: defaultTheme });

const columns = defineColumns<User>([
  { key: 'firstName', header: 'First name', width: 2, sortable: true },
  { key: 'lastName', header: 'Last name', width: 2, sortable: true },
  { key: 'email', header: 'Email', width: 4 },
  { key: 'country', header: 'Country', width: 2, sortable: true },
]);

// What the server's find of the users takes: a search text (the criteria), a sort and a window of rows.
type UserCriteria = { text?: string };

const SORT_KEYS = ['firstName', 'lastName', 'country'] as const;

let finds = 0;

// The server's find, here over the demo's users (`fetchUsers` takes the table's query, so it is turned back into one).
async function findUsers(
  criteria: UserCriteria,
  sort: RowSort<(typeof SORT_KEYS)[number]> | undefined,
  { offset, limit }: RowPaging,
  signal: AbortSignal,
): Promise<FoundPage<User>> {
  finds += 1;

  const query = { page: offset / limit + 1, pageSize: limit, sort, search: criteria.text ?? '', filters: {} };
  const { rows, total } = await fetchUsers(query, signal);

  return { items: rows, total };
}

// The "TanStack Query" tab: the users through the page's TanStack Query (`@local/data-table/react-query`), from a
// server's find (`useFindSource`: the table's query as criteria, sort and window). Every page is a query: paging back
// shows it from the cache at once (fresh for 30 seconds), and "Invalidate" (what an app does after a change) reloads
// the table by itself.
function QueryDemo() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Users />
    </QueryClientProvider>
  );
}

function Users() {
  const queryClient = useQueryClient();
  const [loads, setLoads] = useState(0);
  const source = useFindSource(['users'], SORT_KEYS, criteriaOf<UserCriteria>('text'), async (...args) => {
    const page = await findUsers(...args);

    setLoads(finds);

    return page;
  });

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <button
          className="ui-button"
          type="button"
          onClick={() => void queryClient.invalidateQueries({ queryKey: ['users'] })}
        >
          Invalidate
        </button>
        <span className={note}>Finds on the server: {loads}</span>
      </div>
      <DataTable source={source} rowKey="id" columns={columns} searchable pageSize={10} />
    </div>
  );
}
