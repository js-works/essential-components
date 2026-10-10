import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DataTable } from '../api';
import { textColumnEditor } from './editors';
import {
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
} from './filters';
import { setupDataTable } from './setupDataTable';

type Person = { id: number; name: string; city: string };

const people: readonly Person[] = Array.from({ length: 30 }, (_, index) => ({
  id: index + 1,
  name: `Person ${String(index + 1).padStart(2, '0')}`,
  city: index % 2 === 0 ? 'Vienna' : 'Berlin',
}));

function createSource() {
  return vi.fn(async (query: DataTable.Query): Promise<DataTable.Result<Person>> => ({
    rows: people.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
    total: people.length,
  }));
}

// Every test registers its element class under a tag name of its own (a class can be registered once only).
let tags = 0;

function define(elementClass: CustomElementConstructor): string {
  const tag = `test-data-table-${++tags}`;

  customElements.define(tag, elementClass);

  return tag;
}

// Registers the class (once) and creates an element of it: an element class must be registered before `new`.
function create<E extends HTMLElement>(elementClass: new() => E): E {
  if (customElements.getName(elementClass as CustomElementConstructor) === null) {
    define(elementClass as CustomElementConstructor);
  }

  return new elementClass();
}

async function mount(element: HTMLElement): Promise<void> {
  await act(async () => {
    document.body.append(element);
  });
}

afterEach(async () => {
  await act(async () => {
    document.body.replaceChildren();
  });
});

describe('setupDataTable', () => {
  it('returns an element class and a controller factory; the element renders the rows of its controller', async () => {
    const [ElementClass, createController] = setupDataTable();
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'city', header: 'City', render: (person) => person.city.toUpperCase() },
      ],
      title: 'People',
    });
    await mount(element);

    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());
    expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy();
    expect(screen.getAllByText('VIENNA').length).toBeGreaterThan(0);
    expect(screen.getByText('People')).toBeTruthy();
  });

  it('renders into its light DOM and is empty without a controller', async () => {
    const [ElementClass] = setupDataTable();
    const element = create(ElementClass);

    await mount(element);

    expect(element.shadowRoot).toBeNull();
    expect(element.childElementCount).toBe(0);
    expect(element.hasAttribute('data-data-table-host')).toBe(true);
  });

  it('adds its stylesheet once per document', async () => {
    const [ElementClass, createController] = setupDataTable();
    const tag = define(ElementClass);
    const before = document.head.querySelectorAll('style').length;

    for (let index = 0; index < 2; index++) {
      const element = document.createElement(tag) as InstanceType<typeof ElementClass>;

      element.controller = createController({ source: createSource(), rowKey: 'id', columns: [] });
      await mount(element);
    }

    expect(document.head.querySelectorAll('style').length - before).toBeLessThanOrEqual(1);
  });

  it('takes over properties set before the element was defined', async () => {
    const [ElementClass, createController] = setupDataTable();
    const tag = `test-data-table-${++tags}`;
    const element = document.createElement(tag) as InstanceType<typeof ElementClass>;

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
    });
    customElements.define(tag, ElementClass);
    await mount(element);

    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());
  });
});

describe('content', () => {
  it('renders DOM nodes by default, and calls content functions once per place', async () => {
    const [ElementClass, createController] = setupDataTable();
    const header = vi.fn(() => {
      const node = document.createElement('em');

      node.textContent = 'Town';

      return node;
    });
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [
        { key: 'name', header: 'Name' },
        {
          key: 'city',
          header,
          render: (person) => {
            const node = document.createElement('b');

            node.textContent = person.city;

            return node;
          },
        },
      ],
    });
    await mount(element);

    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());
    expect(screen.getByText('Town').tagName).toBe('EM');
    expect(header).toHaveBeenCalled();
    // A node per row: the same node can be in one place only.
    expect(element.querySelectorAll('b').length).toBe(25);
  });

  it('hands content of its own type to the content adapter, and strings are always text', async () => {
    type Badge = { badge: string };

    const adapter: DataTable.ContentAdapter<Badge> = {
      render: vi.fn((content: Badge, container: HTMLElement) => {
        container.textContent = `[${content.badge}]`;
      }),
      clear: vi.fn(),
    };
    const [ElementClass, createController] = setupDataTable({ content: adapter });
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'city', header: () => ({ badge: 'City' }), render: (person) => ({ badge: person.city }) },
      ],
    });
    await mount(element);

    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());
    expect(screen.getByText('[City]')).toBeTruthy();
    expect(screen.getAllByText('[Vienna]').length).toBeGreaterThan(0);
    expect(adapter.render).toHaveBeenCalled();

    await act(async () => {
      element.remove();
    });
    await waitFor(() => expect(adapter.clear).toHaveBeenCalled());
  });

  it('calls content and text functions again when the i18n adapter reports a change of the language', async () => {
    const listeners = new Set<() => void>();
    let language = 'en';
    const i18n: DataTable.I18nAdapter = {
      currentLocale: () => (language === 'en' ? 'en-US' : 'de-DE'),
      resolveText: (_namespace, _key, _params, defaultValue) => defaultValue,
      onChange: (listener) => {
        listeners.add(listener);

        return () => listeners.delete(listener);
      },
    };
    const [ElementClass, createController] = setupDataTable({
      i18n: { type: 'factory', getAdapter: () => i18n },
    });
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [{ key: 'name', header: () => (language === 'en' ? 'Name' : 'Vorname') }],
      title: () => (language === 'en' ? 'People' : 'Personen'),
    });
    await mount(element);
    await waitFor(() => expect(screen.getByText('People')).toBeTruthy());

    language = 'de';
    await act(async () => listeners.forEach((listener) => listener()));

    expect(screen.getByText('Personen')).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Vorname' })).toBeTruthy();
  });

  it('asks the i18n factory once per element, with the element, on its first connect', async () => {
    const i18n: DataTable.I18nAdapter = {
      currentLocale: () => 'de-DE',
      resolveText: (_namespace, key, _params, defaultValue) => (key === 'perPage' ? '10 pro Seite' : defaultValue),
    };
    const getAdapter = vi.fn((_element: HTMLElement) => i18n);
    const [ElementClass, createController] = setupDataTable({ i18n: { type: 'factory', getAdapter } });
    const element = create(ElementClass);

    expect(getAdapter).not.toHaveBeenCalled();

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
    });
    await mount(element);
    await waitFor(() => expect(screen.getByRole('button', { name: '10 pro Seite' })).toBeTruthy());

    await act(async () => {
      element.remove();
      document.body.append(element);
    });

    expect(getAdapter).toHaveBeenCalledTimes(1);
    expect(getAdapter).toHaveBeenCalledWith(element);
  });

  it('throws a TypeError for an unknown i18n type (e.g. an adapter given directly)', () => {
    const i18n = { currentLocale: () => 'en-US', resolveText: () => '' };

    expect(() => setupDataTable({ i18n: i18n as unknown as DataTable.SetupConfig['i18n'] })).toThrow(TypeError);
  });

  it('renders action icons and tips, and a tip may be a function', async () => {
    const [ElementClass, createController] = setupDataTable();
    const onClick = vi.fn();
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
      actions: [
        {
          type: 'general',
          key: 'add',
          icon: () => document.createElement('i'),
          tip: () => 'Add person',
          onClick,
        },
      ],
    });
    await mount(element);

    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());
    const button = screen.getByRole('button', { name: 'Add person' });

    expect(button.querySelector('i')).not.toBeNull();
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});

describe('column filters', () => {
  it('renders the built-in filters and an own filter function', async () => {
    const [ElementClass, createController] = setupDataTable();
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [
        { key: 'name', header: 'Name', filter: textColumnFilter({ placeholder: 'Find a name' }) },
        { key: 'city', header: 'City', filter: selectColumnFilter({ options: ['Vienna', 'Berlin'] }) },
        {
          key: 'id',
          header: 'Id',
          filter: ({ onChange }) => {
            const button = document.createElement('button');

            button.textContent = 'Only 1';
            button.addEventListener('click', () => onChange('1'));

            return button;
          },
        },
      ],
    });
    await mount(element);

    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());
    // The filters are in the popup of the filter button.
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(await screen.findByPlaceholderText('Find a name')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Only 1' })).toBeTruthy();
    expect(typeof dateRangeColumnFilter()).toBe('object');
    expect(typeof numberRangeColumnFilter()).toBe('object');
    expect(typeof booleanColumnFilter()).toBe('object');
  });

  it('starts with the default filters of its controller', async () => {
    const [ElementClass, createController] = setupDataTable();
    const element = create(ElementClass);
    const source = createSource();

    element.controller = createController({
      source,
      rowKey: 'id',
      columns: [
        { key: 'name', header: 'Name' },
        { key: 'city', header: 'City', filter: selectColumnFilter({ options: ['Vienna', 'Berlin'] }) },
      ],
      defaultFilters: { city: 'Berlin' },
    });
    await mount(element);

    await waitFor(() =>
      expect(source).toHaveBeenCalledWith(
        expect.objectContaining({ filters: { city: 'Berlin' } }),
        expect.any(AbortSignal),
      )
    );
  });
});

describe('attributes', () => {
  it('reflects the settings between attributes and properties, and passes them to the table', async () => {
    const [ElementClass, createController] = setupDataTable();
    const element = create(ElementClass);

    element.controller = createController({ source: createSource(), rowKey: 'id', columns: [] });
    element.setAttribute('density', 'compact');
    element.striped = true;
    await mount(element);

    expect(element.density).toBe('compact');
    expect(element.footer).toBe('always');
    expect(element.hasAttribute('striped')).toBe(true);
    expect(element.searchable).toBe(false);
    expect(element.reloadable).toBe(false);
    expect(element.showTotal).toBe(false);
    expect(element.selectionAppearance).toBe('accent');
    expect(element.pageSize).toBe(25);
    await waitFor(() => expect(element.querySelector('[data-density="compact"]')).not.toBeNull());

    await act(async () => {
      element.density = 'comfortable';
      element.searchable = true;
      element.reloadable = true;
      element.showTotal = true;
    });
    expect(element.getAttribute('density')).toBe('comfortable');
    expect(element.hasAttribute('show-total')).toBe(true);
    expect(element.querySelector('[data-density="comfortable"]')).not.toBeNull();
    expect(screen.getByPlaceholderText('Search')).toBeTruthy();
    expect(element.hasAttribute('reloadable')).toBe(true);
    expect(screen.getByRole('button', { name: 'Reload' })).toBeTruthy();
    expect(screen.getByRole('button', { name: / per page$/ })).toBeTruthy();

    await act(async () => {
      element.footer = 'never';
    });
    expect(element.getAttribute('footer')).toBe('never');
    expect(screen.queryByRole('button', { name: / per page$/ })).toBeNull();
  });

  it('fixes the layout by its attribute: not set means the user chooses, an invalid value is not set', async () => {
    const [ElementClass, createController] = setupDataTable();
    const element = create(ElementClass);

    element.controller = createController({ source: createSource(), rowKey: 'id', columns: [] });
    await mount(element);

    expect(element.layout).toBeUndefined();

    await act(async () => {
      element.layout = 'cards';
    });
    expect(element.getAttribute('layout')).toBe('cards');
    expect(await screen.findByRole('list')).toBeTruthy();

    element.setAttribute('layout', 'wide');
    expect(element.layout).toBeUndefined();

    await act(async () => {
      element.layout = undefined;
    });
    expect(element.hasAttribute('layout')).toBe(false);
  });

  it('takes the defaults of its setup where it has no attribute of its own', async () => {
    const [ElementClass, createController] = setupDataTable({
      defaults: { selectionAppearance: 'neutral', density: 'compact', pageSize: 10 },
    });
    const source = createSource();
    const element = create(ElementClass);

    element.controller = createController({ source, rowKey: 'id', columns: [{ key: 'name', header: 'Name' }] });
    await mount(element);

    expect(element.selectionAppearance).toBe('neutral');
    expect(element.density).toBe('compact');
    expect(element.footer).toBe('always');
    await waitFor(() => expect(element.querySelector('[data-selection-appearance="neutral"]')).not.toBeNull());
    await waitFor(() =>
      expect(source).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 10 }), expect.anything())
    );

    // its own attribute wins
    await act(async () => {
      element.selectionAppearance = 'accent';
    });
    expect(element.selectionAppearance).toBe('accent');
    expect(element.querySelector('[data-selection-appearance="accent"]')).not.toBeNull();
  });

  it('starts with the page size of its attribute', async () => {
    const [ElementClass, createController] = setupDataTable();
    const source = createSource();
    const element = create(ElementClass);

    element.controller = createController({ source, rowKey: 'id', columns: [{ key: 'name', header: 'Name' }] });
    element.setAttribute('page-size', '10');
    await mount(element);

    await waitFor(() =>
      expect(source).toHaveBeenCalledWith(expect.objectContaining({ pageSize: 10 }), expect.anything())
    );
  });
});

describe('controller', () => {
  it('reloads, reports and clears the selection, typed by the rows of its source', async () => {
    const [ElementClass, createController] = setupDataTable();
    const source = createSource();
    const controller = createController({
      source,
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
      actions: [{ type: 'multiRow', key: 'remove', label: 'Remove', onClick: () => {} }],
    });
    const listener = vi.fn();
    const element = create(ElementClass);

    controller.onSelectionChange(listener);
    element.controller = controller;
    await mount(element);
    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());

    await act(async () => {
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
    });
    const selected: readonly Person[] = controller.getSelectedRows();

    expect(selected.map((person) => person.name)).toEqual(['Person 01']);
    expect(listener).toHaveBeenLastCalledWith([people[0]]);

    await act(async () => controller.clearRowSelection());
    expect(controller.getSelectedRows()).toEqual([]);
    expect(listener).toHaveBeenLastCalledWith([]);

    const calls = source.mock.calls.length;

    await act(async () => controller.reload());
    await waitFor(() => expect(source.mock.calls.length).toBe(calls + 1));
  });

  it('stops reporting after the returned function was called', async () => {
    const [ElementClass, createController] = setupDataTable();
    const controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
      actions: [{ type: 'multiRow', key: 'remove', label: 'Remove', onClick: () => {} }],
    });
    const listener = vi.fn();
    const element = create(ElementClass);

    const off = controller.onSelectionChange(listener);

    off();
    element.controller = controller;
    await mount(element);
    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());

    await act(async () => {
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
    });
    expect(listener).not.toHaveBeenCalled();
  });

  it('belongs to one element, and only to an element of its own setup', () => {
    const [ElementClass, createController] = setupDataTable();
    const [OtherClass] = setupDataTable();
    const controller = createController({ source: createSource(), rowKey: 'id', columns: [] });

    const first = create(ElementClass);
    const second = create(ElementClass);
    const other = create(OtherClass);

    first.controller = controller;
    expect(() => {
      second.controller = controller;
    }).toThrow('already set on another data table');

    // Released by the first element: now the second one may take it.
    first.controller = undefined;
    second.controller = controller;
    expect(second.controller).toBe(controller);

    // Both setups have the content type `Node` here, so only the check at runtime tells them apart.
    expect(() => {
      other.controller = controller;
    }).toThrow(TypeError);
  });

  it('replaces the whole table when a new controller is set', async () => {
    const [ElementClass, createController] = setupDataTable();
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
    });
    await mount(element);
    await waitFor(() => expect(screen.getByRole('columnheader', { name: 'Name' })).toBeTruthy());

    await act(async () => {
      element.controller = createController({
        source: createSource(),
        rowKey: 'id',
        columns: [{ key: 'city', header: 'City' }],
      });
    });

    await waitFor(() => expect(screen.getByRole('columnheader', { name: 'City' })).toBeTruthy());
    expect(screen.queryByRole('columnheader', { name: 'Name' })).toBeNull();
  });

  it('keeps the table when the element is moved', async () => {
    const [ElementClass, createController] = setupDataTable();
    const source = createSource();
    const element = create(ElementClass);
    const container = document.createElement('div');

    element.controller = createController({ source, rowKey: 'id', columns: [{ key: 'name', header: 'Name' }] });
    await mount(element);
    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());
    const calls = source.mock.calls.length;

    await act(async () => {
      document.body.append(container);
      container.append(element);
    });

    expect(within(container).getByText('Person 01')).toBeTruthy();
    expect(source.mock.calls.length).toBe(calls);
  });

  it('groups the rows when the controller has groupBy, with its renderGroup as content', async () => {
    const [ElementClass, createController] = setupDataTable();
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
      groupBy: (person) => (person.id <= 5 ? 'First' : 'Rest'),
      renderGroup: (group) => `${group.key} (${group.rows.length})`,
    });
    await mount(element);

    await waitFor(() => expect(screen.getByText('First (5)')).toBeTruthy());
    expect(screen.getByText('Rest (20)')).toBeTruthy();
  });

  it('runs a group action with its group, and moves a row into another group', async () => {
    const [ElementClass, createController] = setupDataTable();
    const onClick = vi.fn();
    const reorder = vi.fn();
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      reorder,
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
      groupBy: (person) => (person.id <= 5 ? 'First' : 'Rest'),
      actions: [{ type: 'group', key: 'rename', label: () => 'Rename', onClick }],
    });
    await mount(element);
    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());

    fireEvent.click(screen.getAllByRole('button', { name: 'Rename' })[1]!);
    expect(onClick).toHaveBeenCalledWith(expect.objectContaining({ key: 'Rest', total: undefined }));

    // Down from the last row of "First": past the header of "Rest", to its start.
    fireEvent.keyDown(screen.getAllByRole('button', { name: 'Move row' })[4]!, { key: 'ArrowDown', altKey: true });

    await waitFor(() =>
      expect(reorder).toHaveBeenCalledWith({ row: people[4], group: 'Rest', after: people[3], before: people[5] })
    );
  });

  it('moves rows with the handles when the controller has reorder', async () => {
    const [ElementClass, createController] = setupDataTable();
    const reorder = vi.fn();
    const element = create(ElementClass);

    element.controller = createController({
      source: createSource(),
      reorder,
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name' }],
    });
    await mount(element);
    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());

    fireEvent.keyDown(screen.getAllByRole('button', { name: 'Move row' })[0]!, { key: 'ArrowDown', altKey: true });

    await waitFor(() => expect(reorder).toHaveBeenCalledWith({ row: people[0], after: people[1], before: people[2] }));
  });

  it('edits a row with the controller: a built-in editor, and one of its own (made once, a DOM input)', async () => {
    const [ElementClass, createController] = setupDataTable();
    const saveRow = vi.fn();
    const element = create(ElementClass);
    const cityEditor = vi.fn((props: DataTable.EditorProps<Person>) => {
      const input = document.createElement('input');

      input.value = props.draft.city;
      input.setAttribute('aria-label', 'City');
      input.addEventListener('input', () => props.change({ city: input.value }));

      return input;
    });
    const controller = createController({
      source: createSource(),
      saveRow,
      rowKey: 'id',
      columns: [
        { key: 'name', header: 'Name', edit: textColumnEditor() },
        { key: 'city', header: 'City', edit: cityEditor },
      ],
    });

    element.controller = controller;
    await mount(element);
    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());

    act(() => controller.editRow(people[0]!));

    const name = screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });
    const city = screen.getByRole<HTMLInputElement>('textbox', { name: 'City' });

    fireEvent.change(name, { target: { value: 'Ada' } });
    fireEvent.input(city, { target: { value: 'Oslo' } });
    // Made once: typing does not make a new input.
    expect(cityEditor).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('textbox', { name: 'City' })).toBe(city);

    fireEvent.keyDown(name, { key: 'Enter' });

    await waitFor(() => expect(saveRow).toHaveBeenCalledWith(people[0], { id: 1, name: 'Ada', city: 'Oslo' }));
    await waitFor(() => expect(screen.getByText('Oslo')).toBeTruthy());
  });

  it('adds a new row with the controller, with the extra fields of editFields', async () => {
    const [ElementClass, createController] = setupDataTable();
    const createRow = vi.fn(async (draft: Person) => ({ ...draft, id: 100 }));
    const element = create(ElementClass);
    const controller = createController({
      source: createSource(),
      createRow,
      rowKey: 'id',
      columns: [{ key: 'name', header: 'Name', edit: textColumnEditor() }],
      editFields: [{ key: 'city', label: () => 'Town', edit: textColumnEditor() }],
    });

    element.controller = controller;
    await mount(element);
    await waitFor(() => expect(screen.getByText('Person 01')).toBeTruthy());

    act(() => controller.addRow({ id: 0, name: '', city: '' }));

    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), { target: { value: 'Grace' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Town' }), { target: { value: 'Lisbon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    await waitFor(() => expect(createRow).toHaveBeenCalledWith({ id: 0, name: 'Grace', city: 'Lisbon' }));
    await waitFor(() => expect(screen.getByText('Grace')).toBeTruthy());
  });
});
