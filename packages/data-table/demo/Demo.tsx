import { useState } from 'react';
import type { ReactElement } from 'react';
import {
  autocompleteFilter,
  booleanFilter,
  createDataTableComponent,
  dateColumnEditor,
  dateRangeFilter,
  defineFilters,
  numberRangeFilter,
  selectColumnEditor,
  selectFilter,
  textColumnEditor,
  textFilter,
  useDataTableController,
  useDataTableSelection,
} from '../src/react/index.js';
import type {
  ColumnGroup,
  DataTableComponent,
  EditField,
  SavedFilter,
  SavedFilters,
  TableColumn,
} from '../src/react/index.js';
import { antdTheme, defaultTheme, mantineTheme, softTheme } from '../src/themes/index.js';
import type { Controls, DemoTheme } from './controls.js';
import { countries, createUser, fetchNothing, fetchUsers, newUser, roles, saveUser, suggestEmails } from './data.js';
import type { User } from './data.js';
import { badge, fixedHeight, note, selectedLine, suggestion } from './Demo.module.css';
import { DemoControls } from './DemoControls.js';
import { i18n } from './i18n.js';
import { icons } from './icons.js';
import { createActions } from './shared.js';
import { useToasts } from './Toasts.js';
import antdVariables from './variables/antd.css?inline';
import mantineVariables from './variables/mantine.css?inline';

export { Demo };

// An app creates its data table once, with its configuration. The demo creates one per theme, all with the same
// I18nAdapter, and shows the one of the chosen theme.
const tables: Record<DemoTheme, DataTableComponent> = {
  default: createDataTableComponent({ i18n, theme: defaultTheme }),
  soft: createDataTableComponent({ i18n, theme: softTheme }),
  mantine: createDataTableComponent({ i18n, theme: mantineTheme }),
  antd: createDataTableComponent({ i18n, theme: antdTheme }),
};

// The Mantine and antd themes read the variables of their library, which a real app gets from the library. The demo
// runs no library code, so it adds static snapshots of them (`variables/`, see scripts/library-variables.mjs).
const libraryVariables: Record<DemoTheme, string> = {
  default: '',
  soft: '',
  mantine: mantineVariables,
  antd: antdVariables,
};

type UserColumn = TableColumn<User>;

// The edit form ("Edit", a double click; "Add user" for a new row): a field for every column with an editor (`edit`,
// also a hidden one), then the extra fields, values that are no column (`editFields`).
const editFields: readonly EditField<User>[] = [
  { key: 'city', label: 'City', edit: textColumnEditor() },
  { key: 'notes', label: 'Notes', edit: textColumnEditor({ placeholder: 'A note about the user' }) },
];

const firstName: UserColumn = {
  key: 'firstName',
  header: 'First name',
  width: 2,
  sortable: true,
  edit: textColumnEditor(),
};
const lastName: UserColumn = {
  key: 'lastName',
  header: 'Last name',
  width: 2,
  sortable: true,
  edit: textColumnEditor(),
};
// The column toggle menu: every column but the names can be hidden; logins and active (below) start hidden.
const email: UserColumn = {
  key: 'email',
  header: 'Email',
  width: 4,
  sortable: true,
  hideable: true,
  edit: textColumnEditor(),
};
const country: UserColumn = {
  key: 'country',
  header: 'Country',
  width: 2,
  sortable: true,
  hideable: true,
  edit: selectColumnEditor({ options: countries }),
};

// The date of birth, shown as it is stored (ISO, yyyy-mm-dd).
const dateOfBirth: UserColumn = {
  key: 'dateOfBirth',
  header: 'Date of birth',
  width: 2,
  sortable: true,
  hideable: true,
  // A calendar, like the date range filter.
  edit: dateColumnEditor(),
};

// Custom cell content can use the tokens of the table too, so it follows the theme.
const role: UserColumn = {
  key: 'role',
  header: 'Role',
  width: 1.5,
  align: 'center',
  sortable: true,
  hideable: true,
  render: (user) => <span className={badge}>{user.role}</span>,
  edit: selectColumnEditor({ options: roles }),
};

const logins: UserColumn = {
  key: 'logins',
  header: 'Logins',
  width: 1.2,
  align: 'end',
  sortable: true,
  hideable: true,
  hidden: true,
};

const active: UserColumn = {
  key: 'active',
  header: 'Active',
  hideable: true,
  hidden: true,
  width: 1.2,
  // Every other column can be resized by its header's handle; this one cannot.
  resizable: false,
  render: (user) => (user.active ? 'Yes' : 'No'),
};

// The filters of the table (`filters`), in the order of the filter view; each is labeled by the header of the column
// of its key.
const filters = defineFilters({
  // With the select of how the text must match (contains, starts with, ends with); the other text filters are plain.
  firstName: textFilter({ matchModes: true }),
  lastName: textFilter({ matchModes: true }),
  dateOfBirth: dateRangeFilter(),
  // An autocomplete: its options are loaded while typing, each with the user's name below the email.
  email: autocompleteFilter({
    multiple: true,
    load: async (query, signal) =>
      (await suggestEmails(query, signal)).map(({ name, ...option }) => ({
        ...option,
        content: () => (
          <span className={suggestion}>
            {option.label}
            <small>{name}</small>
          </span>
        ),
      })),
  }),
  country: selectFilter({ options: countries, multiple: true }),
  role: selectFilter({ options: roles }),
  logins: numberRangeFilter(),
  active: booleanFilter(),
});

function createColumns(grouped: boolean): readonly (UserColumn | ColumnGroup<User>)[] {
  return grouped
    ? [
      { header: 'Person', columns: [firstName, lastName, dateOfBirth, email] },
      { header: 'Location', columns: [country] },
      role,
      { header: 'Account', columns: [logins, active] },
    ]
    : [firstName, lastName, dateOfBirth, email, country, role, logins, active];
}

// The content of the demo element: plain elements only, no UI library. The page around it (title, language, color
// scheme) is not part of it.
function Demo({ controls }: { controls: Controls }): ReactElement {
  const DataTable = tables[controls.theme];
  const { show, toasts } = useToasts();
  // The controller: the buttons below the table reload it and clear its selection, and the line shows the selected
  // users as they change.
  const nav = useDataTableController<User>();
  const selected = useDataTableSelection(nav);
  // New columns on every render: the table needs no `useMemo`.
  const columns = createColumns(controls.columns === 'grouped');
  const actions = createActions(show, controls.actions, icons, controls.variants === 'on', {
    editRow: nav.editRow,
    addRow: () => nav.addRow(newUser()),
  });
  // Saved filters (in the filter view and the drawer), kept in memory: a name saved again replaces the
  // filter of that name. With sharing (the demo has one user: shared ones are only marked).
  const [saved, setSaved] = useState<readonly SavedFilter[]>([]);
  const savedFilters: SavedFilters = {
    items: saved,
    sharing: true,
    save: (name, filters, { shared }) => {
      setSaved((current) => [
        ...current.filter((item) => item.name !== name),
        { id: crypto.randomUUID(), name, filters, shared },
      ]);
      show(`Saved filter "${name}"`);
    },
    remove: (id) => setSaved((current) => current.filter((item) => item.id !== id)),
    setShared: (id, shared) =>
      setSaved((current) => current.map((item) => (item.id === id ? { ...item, shared } : item))),
  };

  return (
    <div className="ui-stack">
      <style>{libraryVariables[controls.theme]}</style>
      <DemoControls controls={controls} />
      <div className={controls.height === 'fixed' ? fixedHeight : undefined}>
        <DataTable
          controller={nav}
          title="Active customers"
          subtitle="Customers who placed an order or contacted support in the last 30 days"
          searchable
          reloadable
          showTotal
          key={controls.data}
          source={controls.data === 'users' ? fetchUsers : fetchNothing}
          empty={controls.data === 'custom' ? <p>Nobody here yet. Add the first user!</p> : undefined}
          rowKey="id"
          columns={columns}
          filters={controls.filters === 'on' ? filters : undefined}
          selectionAppearance={controls.selectionAppearance}
          rowActionLook={controls.rowActionLook}
          density={controls.density}
          layout={controls.layout === 'user' ? undefined : controls.layout}
          footer={controls.footer}
          striped={controls.striped === 'on'}
          actions={actions}
          pageSize={10}
          pageSizeOptions={[10, 25, 50]}
          saveRow={async (_user, draft) => {
            const saved = await saveUser(draft);

            show(`Saved ${saved.firstName} ${saved.lastName}`);

            return saved;
          }}
          createRow={async (draft) => {
            const created = await createUser(draft);

            show(`Added ${created.firstName} ${created.lastName}`);

            return created;
          }}
          editFields={editFields}
          savedFilters={savedFilters}
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
