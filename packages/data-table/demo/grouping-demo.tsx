import { useState } from 'react';
import {
  createDataTableComponent,
  defineActions,
  defineColumns,
  defineFilters,
  multiRowAction,
  selectFilter,
  textFilter,
} from '../src/react/index.js';

import type { RowSource } from '../src/react/index.js';
import { defaultTheme } from '../src/themes/index.js';
import { fetchUsersByCountry, roles } from './data.js';
import type { User } from './data.js';
import { badge, fixedHeight, note } from './demo.module.css';
import { i18n } from './i18n.js';
import { icons } from './icons.js';
import { fullName } from './shared.js';
import { useToasts } from './toasts.js';

export { GroupingDemo };

const DataTable = createDataTableComponent({ i18n, theme: defaultTheme });

// The country is the group, so it has no column of its own. Typed by `defineColumns` (and the actions by
// `defineActions`): no type annotation.
const columns = defineColumns<User>([
  { key: 'firstName', header: 'First name', width: 2, sortable: true },
  { key: 'lastName', header: 'Last name', width: 2, sortable: true },
  { key: 'email', header: 'Email', width: 4, sortable: true },
  {
    key: 'role',
    header: 'Role',
    width: 1.5,
    align: 'center',
    sortable: true,
    render: (user) => <span className={badge}>{user.role}</span>,
  },
]);

const filters = defineFilters({
  firstName: textFilter(),
  lastName: textFilter(),
  role: selectFilter({ options: roles }),
});

type Totals = 'source' | 'page';
type Header = 'default' | 'custom';

// Without the totals of the source, a group counts only its rows on the page.
const fetchWithoutTotals: RowSource<User> = async (query, signal) => {
  const { rows, total } = await fetchUsersByCountry(query, signal);

  return { rows, total };
};

// The "Row grouping" tab: the users grouped by country (`groupBy="country"`). The source sorts by country first and
// gives the total of every group on the page (`Result.groups`); a group that runs over a page break shows "5 of 37".
// Group headers collapse and expand their group (a matter of the view, kept across pages), and select its rows.
function GroupingDemo() {
  const { show, toasts } = useToasts();
  const [totals, setTotals] = useState<Totals>('source');
  const [header, setHeader] = useState<Header>('default');

  const actions = defineActions<User>([
    multiRowAction('message', (users) => show(`Message to ${users.map(fullName).join(', ')}`), {
      label: 'Send message',
      icon: icons.info,
    }),
  ]);

  return (
    <div className="ui-stack">
      <div className="ui-toolbar">
        <label className="ui-field">
          Group totals
          <select
            className="ui-select"
            value={totals}
            onChange={(event) => setTotals(event.currentTarget.value as Totals)}
          >
            <option value="source">from the source</option>
            <option value="page">page only</option>
          </select>
        </label>
        <label className="ui-field">
          Group header
          <select
            className="ui-select"
            value={header}
            onChange={(event) => setHeader(event.currentTarget.value as Header)}
          >
            <option value="default">default</option>
            <option value="custom">custom (renderGroup)</option>
          </select>
        </label>
      </div>
      <div className={fixedHeight}>
        <DataTable
          // A new source is a new table (the source's identity alone never reloads).
          key={totals}
          title="Users by country"
          subtitle="Collapse a country with its header, or select all of its users on the page"
          searchable
          reloadable
          source={totals === 'source' ? fetchUsersByCountry : fetchWithoutTotals}
          rowKey="id"
          columns={columns}
          filters={filters}
          actions={actions}
          groupBy="country"
          // A checkbox in every group header, for all its users on the page (opt-in).
          selectableGroups
          renderGroup={header === 'custom'
            ? (group) => (
              <span>
                {group.key} <span className={note}>({group.total ?? group.rows.length} users)</span>
              </span>
            )
            : undefined}
          striped
          pageSize={25}
          pageSizeOptions={[10, 25, 50, 100, 250]}
          defaultSort={{ key: 'lastName', direction: 'asc' }}
        />
      </div>
      {toasts}
    </div>
  );
}
