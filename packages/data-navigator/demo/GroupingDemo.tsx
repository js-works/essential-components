import { useState } from 'react';
import type { ReactElement } from 'react';
import { createDataNavigatorComponent, selectColumnFilter, textColumnFilter } from '../src/react';
import type { DataNavigatorComponent } from '../src/react';
import { defaultTheme } from '../src/themes';
import { fetchUsersByCountry, roles } from './data';
import type { User } from './data';
import { badge, fixedHeight, note } from './Demo.module.css';
import { i18n } from './i18n';
import { icons } from './icons';
import { fullName } from './shared';
import { useToasts } from './Toasts';

export { GroupingDemo };

const DataNavigator = createDataNavigatorComponent({ i18n, theme: defaultTheme });

// The country is the group, so it has no column of its own.
const columns: readonly DataNavigatorComponent.Column<User>[] = [
  { key: 'firstName', header: 'First name', width: 2, sortable: true, filter: textColumnFilter() },
  { key: 'lastName', header: 'Last name', width: 2, sortable: true, filter: textColumnFilter() },
  { key: 'email', header: 'Email', width: 4, sortable: true },
  {
    key: 'role',
    header: 'Role',
    width: 1.5,
    align: 'center',
    sortable: true,
    render: (user) => <span className={badge}>{user.role}</span>,
    filter: selectColumnFilter({ options: roles }),
  },
];

type Totals = 'source' | 'page';
type Header = 'default' | 'custom';

// Without the totals of the source, a group counts only its rows on the page.
const fetchWithoutTotals: DataNavigatorComponent.Source<User> = async (query, signal) => {
  const { rows, total } = await fetchUsersByCountry(query, signal);

  return { rows, total };
};

// The "Row grouping" tab: the users grouped by country (`groupBy="country"`). The source sorts by country first and
// gives the total of every group on the page (`Result.groups`); a group that runs over a page break shows "5 of 37".
// Group headers collapse and expand their group (a matter of the view, kept across pages), and select its rows.
function GroupingDemo(): ReactElement {
  const { show, toasts } = useToasts();
  const [totals, setTotals] = useState<Totals>('source');
  const [header, setHeader] = useState<Header>('default');

  const actions: readonly DataNavigatorComponent.Action<User>[] = [
    {
      type: 'multiRow',
      key: 'message',
      label: 'Send message',
      icon: icons.info,
      onClick: (users) => show(`Message to ${users.map(fullName).join(', ')}`),
    },
  ];

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
        <DataNavigator
          // A new source is a new table (the source's identity alone never reloads).
          key={totals}
          title="Users by country"
          subtitle="Collapse a country with its header, or select all of its users on the page"
          searchable
          reloadable
          source={totals === 'source' ? fetchUsersByCountry : fetchWithoutTotals}
          rowKey="id"
          columns={columns}
          actions={actions}
          groupBy="country"
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
