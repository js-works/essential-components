import { useMemo } from 'react';
import type { ReactElement } from 'react';
import {
  createDataNavigatorComponent,
  dateRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
  useDataNavigatorSelection,
} from '../src/react';
import type { DataNavigatorComponent } from '../src/react';
import { antdTheme, defaultTheme, mantineTheme } from '../src/themes';
import type { Controls, DemoTheme } from './controls';
import { countries, fetchNothing, fetchUsers, roles } from './data';
import type { User } from './data';
import { badge, fixedHeight, note, selectedLine } from './Demo.module.css';
import { DemoControls } from './DemoControls';
import { i18n } from './i18n';
import { icons } from './icons';
import { createActions } from './shared';
import { useToasts } from './Toasts';
import antdVariables from './variables/antd.css?inline';
import mantineVariables from './variables/mantine.css?inline';

export { Demo };

// An app creates its data navigator once, with its configuration. The demo creates one per theme, all with the same
// I18nAdapter, and shows the one of the chosen theme.
const navigators: Record<DemoTheme, DataNavigatorComponent.Component> = {
  default: createDataNavigatorComponent({ i18n, theme: defaultTheme }),
  mantine: createDataNavigatorComponent({ i18n, theme: mantineTheme }),
  antd: createDataNavigatorComponent({ i18n, theme: antdTheme }),
};

// The Mantine and antd themes read the variables of their library, which a real app gets from the library. The demo
// runs no library code, so it adds static snapshots of them (`variables/`, see scripts/library-variables.mjs).
const libraryVariables: Record<DemoTheme, string> = {
  default: '',
  mantine: mantineVariables,
  antd: antdVariables,
};

type UserColumn = DataNavigatorComponent.Column<User>;

const firstName: UserColumn = { key: 'firstName', header: 'First name', width: 2, sortable: true };
const lastName: UserColumn = { key: 'lastName', header: 'Last name', width: 2, sortable: true };
const email: UserColumn = { key: 'email', header: 'Email', width: 4, sortable: true };
const country: UserColumn = { key: 'country', header: 'Country', width: 2, sortable: true };

// The date of birth, shown as it is stored (ISO, yyyy-mm-dd).
const dateOfBirth: UserColumn = { key: 'dateOfBirth', header: 'Date of birth', width: 2, sortable: true };

// Custom cell content can use the tokens of the table too, so it follows the theme.
const role: UserColumn = {
  key: 'role',
  header: 'Role',
  width: 1.5,
  align: 'center',
  sortable: true,
  render: (user) => <span className={badge}>{user.role}</span>,
};

const filterOf: Record<string, DataNavigatorComponent.ColumnFilter> = {
  firstName: textColumnFilter(),
  lastName: textColumnFilter(),
  email: textColumnFilter(),
  role: selectColumnFilter({ options: roles }),
  country: selectColumnFilter({ options: countries, multiple: true }),
  dateOfBirth: dateRangeColumnFilter(),
};

function createColumns(
  grouped: boolean,
  filtered: boolean,
): readonly (UserColumn | DataNavigatorComponent.ColumnGroup<User>)[] {
  const filter = (column: UserColumn): UserColumn => {
    const columnFilter = filterOf[column.key];

    return filtered && columnFilter ? { ...column, filter: columnFilter } : column;
  };

  return grouped
    ? [
      { header: 'Person', columns: [filter(firstName), filter(lastName), filter(dateOfBirth), filter(email)] },
      { header: 'Location', columns: [filter(country)] },
      filter(role),
    ]
    : [filter(firstName), filter(lastName), filter(dateOfBirth), filter(email), filter(country), filter(role)];
}

// The content of the demo element: plain elements only, no UI library. The page around it (title, language, color
// scheme) is not part of it.
function Demo({ controls }: { controls: Controls }): ReactElement {
  const DataNavigator = navigators[controls.theme];
  const { show, toasts } = useToasts();
  // The controller: the buttons below the table reload it and clear its selection, and the line shows the selected
  // users as they change.
  const nav = useDataNavigatorController<User>();
  const selected = useDataNavigatorSelection(nav);
  const columns = useMemo(
    () => createColumns(controls.columns === 'grouped', controls.filters === 'on'),
    [controls.columns, controls.filters],
  );
  const actions = createActions(show, controls.actions, icons, controls.variants === 'on');

  return (
    <div className="ui-stack">
      <style>{libraryVariables[controls.theme]}</style>
      <DemoControls controls={controls} />
      <div className={controls.height === 'fixed' ? fixedHeight : undefined}>
        <DataNavigator
          controller={nav}
          title="Active customers"
          subtitle="Customers who placed an order or contacted support in the last 30 days"
          searchable
          key={controls.data}
          source={controls.data === 'users' ? fetchUsers : fetchNothing}
          empty={controls.data === 'custom' ? <p>Nobody here yet. Add the first user!</p> : undefined}
          rowKey="id"
          columns={columns}
          selectionAppearance={controls.selectionAppearance}
          density={controls.density}
          striped={controls.striped === 'on'}
          actions={actions}
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
          defaultSort={{ key: 'lastName', direction: 'asc' }}
          renderDetail={(user) => (user.id % 3 === 0 ? null : <span className={note}>{user.notes}</span>)}
        />
      </div>
      <div className="ui-toolbar">
        <button type="button" className="ui-button" onClick={() => nav.reload()}>Reload</button>
        <button type="button" className="ui-button" onClick={() => nav.clearRowSelection()}>Clear selection</button>
        <span className={`ui-note ${selectedLine}`}>
          Selected:{' '}
          {selected.length === 0 ? 'none' : selected.map((user) => `${user.firstName} ${user.lastName}`).join(', ')}
        </span>
      </div>
      {toasts}
    </div>
  );
}
