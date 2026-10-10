import { autocompleteColumnFilter, selectColumnFilter, setupDataTable, textColumnFilter } from '../src';
import type { DataTable } from '../src';
import { defaultTheme } from '../src/themes';
import { countries, fetchUsers, roles, suggestEmails } from './data';
import type { User } from './data';
import { i18n } from './i18n';
import './element-demo.css';

export { mountElementDemo };

// The custom element tab: the same data as the React tab, in plain TypeScript with DOM nodes as content (the default
// content adapter). Everything that depends on the row type is in the controller; the element only has the settings.

// Once per app: the element class and its controller factory, bound to the theme and the i18n factory.
const [DataTableBase, createTableController] = setupDataTable({ theme: defaultTheme, i18n });

class DemoDataTable extends DataTableBase {}

const TAG = 'demo-element-data-table';

// The component under test, registered once (the demo may be on a page twice).
function defineElement(): void {
  if (customElements.get(TAG) === undefined) {
    customElements.define(TAG, DemoDataTable);
  }
}

// A small badge for the role: a DOM node, rendered by the default content adapter (a new node per row).
function roleBadge(role: User['role']): Node {
  const badge = document.createElement('span');

  badge.className = 'element-demo__badge';
  badge.dataset['role'] = role.toLowerCase();
  badge.textContent = role;

  return badge;
}

// An option of the email filter: the email, with the user's name below it.
function suggestion(email: string, name: string): Node {
  const node = document.createElement('span');
  const small = document.createElement('small');

  node.className = 'element-demo__suggestion';
  small.textContent = name;
  node.append(email, small);

  return node;
}

const german = () => document.documentElement.lang.startsWith('de');

function createController(onRemove: (users: readonly User[]) => void) {
  return createTableController({
    source: fetchUsers,
    rowKey: 'id',
    // Functions follow the language: they are called again when the i18n adapter reports a change.
    title: () => (german() ? 'Benutzer (Custom Element)' : 'Users (custom element)'),
    subtitle:
      () => (german() ? 'Einfaches TypeScript, DOM-Knoten als Inhalt' : 'Plain TypeScript, DOM nodes as content'),
    columns: [
      {
        key: 'firstName',
        header: () => (german() ? 'Vorname' : 'First name'),
        sortable: true,
        filter: textColumnFilter(),
      },
      {
        key: 'lastName',
        header: () => (german() ? 'Nachname' : 'Last name'),
        sortable: true,
        filter: textColumnFilter(),
      },
      // The column toggle menu of the toolbar can hide it. Its filter is an autocomplete, with DOM nodes as options.
      {
        key: 'email',
        header: 'Email',
        width: 2,
        hideable: true,
        filter: autocompleteColumnFilter({
          multiple: true,
          load: async (query, signal) =>
            (await suggestEmails(query, signal)).map(({ name, ...option }) => ({
              ...option,
              content: () => suggestion(option.label, name),
            })),
        }),
      },
      {
        key: 'country',
        header: () => (german() ? 'Land' : 'Country'),
        filter: selectColumnFilter({ options: countries, multiple: true }),
      },
      {
        key: 'role',
        header: () => (german() ? 'Rolle' : 'Role'),
        align: 'center',
        render: (user) => roleBadge(user.role),
        filter: selectColumnFilter({ options: roles }),
      },
    ],
    actions: [
      {
        type: 'multiRow',
        key: 'remove',
        label: () => (german() ? 'Entfernen' : 'Remove'),
        variant: 'danger',
        onClick: onRemove,
      },
    ],
    defaultSort: { key: 'lastName', direction: 'asc' },
  });
}

const DENSITIES: readonly DataTable.Density[] = ['compact', 'normal', 'comfortable'];

// Renders the tab into the container and returns its cleanup.
function mountElementDemo(container: HTMLElement): () => void {
  defineElement();

  container.innerHTML = `
    <div class="ui-stack">
      <div class="ui-toolbar">
        <label class="ui-field">Density
          <select class="ui-select" data-density>
            ${
    DENSITIES.map((density) => `<option${density === 'normal' ? ' selected' : ''}>${density}</option>`).join('')
  }
          </select>
        </label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" data-striped checked> Striped</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" data-searchable checked> Searchable</label>
        <label class="ui-field"><input class="ui-checkbox" type="checkbox" data-reloadable checked> Reloadable</label>
      </div>
      <${TAG} class="element-demo__table" striped searchable reloadable show-total page-size="10"></${TAG}>
      <div class="ui-toolbar">
        <button class="ui-button" type="button" data-reload>Reload</button>
        <button class="ui-button" type="button" data-clear>Clear selection</button>
        <span class="ui-note" data-selected>Selected: none</span>
      </div>
    </div>
  `;

  const table = container.querySelector<DemoDataTable>(TAG);
  const density = container.querySelector<HTMLSelectElement>('[data-density]');
  const striped = container.querySelector<HTMLInputElement>('[data-striped]');
  const searchable = container.querySelector<HTMLInputElement>('[data-searchable]');
  const reloadable = container.querySelector<HTMLInputElement>('[data-reloadable]');
  const selected = container.querySelector('[data-selected]');

  if (!table || !density || !striped || !searchable || !reloadable || !selected) {
    return () => {};
  }

  const controller = createController((users) => {
    selected.textContent = `Remove clicked for: ${users.map((user) => user.lastName).join(', ')}`;
  });

  table.controller = controller;

  // The controller is the one channel to the table: its methods, and its subscriptions (typed rows).
  const stopListening = controller.onSelectionChange((users) => {
    selected.textContent = users.length === 0
      ? 'Selected: none'
      : `Selected: ${users.map((user) => `${user.firstName} ${user.lastName}`).join(', ')}`;
  });

  container.querySelector('[data-reload]')?.addEventListener('click', () => controller.reload());
  container.querySelector('[data-clear]')?.addEventListener('click', () => controller.clearRowSelection());
  density.addEventListener('change', () => {
    table.density = DENSITIES.find((value) => value === density.value) ?? 'normal';
  });
  striped.addEventListener('change', () => {
    table.striped = striped.checked;
  });
  searchable.addEventListener('change', () => {
    table.searchable = searchable.checked;
  });
  reloadable.addEventListener('change', () => {
    table.reloadable = reloadable.checked;
  });

  return () => {
    stopListening();
    table.controller = undefined;
    container.replaceChildren();
  };
}
