import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DataNavigator as Spec } from './api';
import { useDataNavigatorController, useDataNavigatorSelection } from './core/controllerHooks';
import { dateRangeColumnFilter, selectColumnFilter, textColumnFilter } from './core/view/ColumnFilters';
import baseStylesheet from './core/view/DataNavigator.module.css?raw';
import { createDataNavigator } from './createDataNavigator';
import { antdTheme } from './themes/antd';
import { defaultTheme } from './themes/default';
import { mantineTheme } from './themes/mantine';

// The component under test: created without a configuration (English texts, the default theme).
const Nav = createDataNavigator();

type Person = { id: number; name: string; city: string };

const people: readonly Person[] = Array.from({ length: 60 }, (_, index) => ({
  id: index + 1,
  name: `Person ${String(index + 1).padStart(2, '0')}`,
  city: index % 2 === 0 ? 'Vienna' : 'Berlin',
}));

const columns: readonly Spec.Column<Person>[] = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'city', header: 'City' },
];

function createSource() {
  return vi.fn(async (query: Spec.Query): Promise<Spec.Result<Person>> => {
    const text = query.search.toLowerCase();
    const { name: nameFilter, city: cityFilter } = query.filters;
    const sorted = people
      .filter((person) => text === '' || `${person.name} ${person.city}`.toLowerCase().includes(text))
      .filter((person) =>
        typeof nameFilter !== 'string' || person.name.toLowerCase().includes(nameFilter.toLowerCase())
      )
      .filter((person) =>
        typeof cityFilter === 'string'
          ? person.city === cityFilter
          : !Array.isArray(cityFilter) || cityFilter.includes(person.city)
      );

    if (query.sort) {
      const key = query.sort.key as keyof Person;
      const factor = query.sort.direction === 'asc' ? 1 : -1;

      sorted.sort((a, b) => factor * String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true }));
    }

    return {
      rows: sorted.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
      total: sorted.length,
    };
  });
}

// The declarations of the stylesheet rules for a selector. jsdom cannot compute every property (for example a border
// shorthand with var(), or scrollbar-gutter), so such rules are checked in the stylesheet itself.
function declarationsOf(selector: string): string {
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText === selector)
    .map((rule) => rule.cssText)
    .join(' ');
}

// The declarations of a rule for a selector that sits inside a media query with the given condition.
function declarationsInMedia(condition: RegExp, selector: string): string {
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule && condition.test(rule.media.mediaText))
    .flatMap((rule) => [...rule.cssRules])
    .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText === selector)
    .map((rule) => rule.cssText)
    .join(' ');
}

// The selection mode follows from the actions (there is no selection prop). Tests that need a mode ask for it with the
// test-only option `selection`, and get an action that needs exactly that mode.
const selectionActions = {
  multi: { type: 'rows', key: 'test-selection-multi', label: 'Rows action', onClick: () => {} },
  single: { type: 'row', key: 'test-selection-single', label: 'Row action', show: 'toolbar', onClick: () => {} },
} as const satisfies Record<'multi' | 'single', Spec.Action<Person>>;

type NavProps = Partial<Spec.Props<Person>> & { selection?: keyof typeof selectionActions };

// The selectors of all style rules inside a media query with the given condition.
function selectorsInMedia(condition: RegExp): string[] {
  return [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule && condition.test(rule.media.mediaText))
    .flatMap((rule) => [...rule.cssRules])
    .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule)
    .map((rule) => rule.selectorText);
}

// The tooltips of the libraries open on hover: send all the events they may listen to.
function hover(element: HTMLElement): void {
  act(() => {
    for (const type of ['pointerover', 'pointerenter', 'mouseover', 'mouseenter', 'mousemove']) {
      element.dispatchEvent(new MouseEvent(type, { bubbles: type !== 'mouseenter' && type !== 'pointerenter' }));
    }
  });
}

async function loaded(): Promise<void> {
  await waitFor(() => expect(document.querySelector('[aria-busy="true"]')).toBeNull());
}

function click(name: string): void {
  fireEvent.click(screen.getByRole('button', { name }));
}

// Chooses an option in a select (Base UI): opens its list when it is not open yet, and clicks the option.
async function chooseIn(trigger: HTMLElement, option: string): Promise<void> {
  if (screen.queryByRole('option', { name: option }) === null) {
    fireEvent.click(trigger);
  }

  // Base UI chooses an option on the pointer sequence of a real mouse, not on a bare click event.
  const item = await screen.findByRole('option', { name: option });

  fireEvent.pointerMove(item, { pointerType: 'mouse' });
  fireEvent.pointerDown(item, { pointerType: 'mouse', button: 0 });
  fireEvent.mouseDown(item);
  fireEvent.pointerUp(item, { pointerType: 'mouse', button: 0 });
  fireEvent.mouseUp(item);
  fireEvent.click(item, { detail: 1 });
}

// Chooses a page size in the footer.
async function choosePageSize(size: number): Promise<void> {
  await chooseIn(screen.getByRole('combobox', { name: 'Page Size' }), String(size));
}

// The field of the filter of the column with this header (an open list is labelled by the header too).
function filterField(header: string): HTMLElement {
  return screen.getAllByRole('combobox', { name: header })[0]!;
}

// Chooses an option in the select filter of the column with this header. A multiple select adds it to the chosen ones.
async function chooseFilterOption(header: string, option: string): Promise<void> {
  await chooseIn(filterField(header), option);
}

// What a select filter shows: the chosen options, or its placeholder.
function shownIn(header: string): string {
  return filterField(header).textContent ?? '';
}

function renderNav(props: NavProps = {}) {
  const { selection, actions = [], ...rest } = props;
  const source = createSource();
  const view = render(
    <Nav
      source={source}
      rowKey="id"
      columns={columns}
      pageSize={10}
      actions={selection === undefined ? actions : [...actions, selectionActions[selection]]}
      {...rest}
    />,
  );

  return { source, ...view };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('DataNavigator', () => {
  it('shows the rows, the item range and the page count', async () => {
    renderNav();

    expect(await screen.findByText('Person 01')).toBeTruthy();
    expect(screen.getByText('Items 1-10 / 60')).toBeTruthy();
    expect(screen.getByText('of 6')).toBeTruthy();
  });

  it('asks the source for the first page with the default sort', async () => {
    const { source } = renderNav({ defaultSort: { key: 'name', direction: 'desc' } });

    await loaded();

    expect(source).toHaveBeenCalledWith(
      { page: 1, pageSize: 10, sort: { key: 'name', direction: 'desc' }, search: '', filters: {} },
      expect.any(AbortSignal),
    );
    expect(screen.getByText('Person 60')).toBeTruthy();
  });

  it('shows the sort hint as a tooltip, not as a native title', async () => {
    renderNav();

    await loaded();

    const header = screen.getByRole('columnheader', { name: /Name/ });

    // our own elements never use the native title attribute as a tooltip

    expect(header.querySelector('[title]')).toBeNull();

    hover(screen.getByRole('button', { name: /Name/ }));

    expect(await screen.findByText('Sort ascending', {}, { timeout: 2000 })).toBeTruthy();
  });

  it('sorts ascending first, then toggles to descending', async () => {
    const { source } = renderNav();

    await loaded();
    click('Name');
    await loaded();

    expect(source).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: { key: 'name', direction: 'asc' } }),
      expect.any(AbortSignal),
    );

    click('Name');
    await loaded();

    expect(source).toHaveBeenLastCalledWith(
      expect.objectContaining({ sort: { key: 'name', direction: 'desc' } }),
      expect.any(AbortSignal),
    );
  });

  it('gives a disabled pager button a transparent background', async () => {
    renderNav();
    await loaded();

    const pager = ['First page', 'Previous page', 'Next page', 'Last page'];

    for (const name of pager) {
      expect(screen.getByRole('button', { name }).classList.contains('pagerButton')).toBe(true);
    }

    // on the first page, first and previous are disabled
    expect((screen.getByRole('button', { name: 'First page' }) as HTMLButtonElement).disabled).toBe(true);

    // jsdom does not compute this: read the rule of the stylesheet
    const rules = [...document.styleSheets]
      .flatMap((sheet) => [...sheet.cssRules])
      .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText.includes('pagerButton'))
      .map((rule) => rule.cssText)
      .join(' ');

    expect(rules).toMatch(/:disabled/);
    expect(rules).toMatch(/background-color:\s*transparent/);
  });

  it('navigates between pages', async () => {
    const { source } = renderNav();

    await loaded();
    click('Next page');
    await loaded();

    expect(source).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }), expect.any(AbortSignal));
    expect(screen.getByText('Items 11-20 / 60')).toBeTruthy();

    click('Last page');
    await loaded();

    expect(screen.getByText('Items 51-60 / 60')).toBeTruthy();

    click('First page');
    await loaded();

    expect(screen.getByText('Items 1-10 / 60')).toBeTruthy();
  });

  it('goes back to the first page when the page size changes', async () => {
    const { source } = renderNav({ pageSizeOptions: [10, 25] });

    await loaded();
    click('Next page');
    await loaded();

    await choosePageSize(25);
    await loaded();

    expect(source).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 1, pageSize: 25 }),
      expect.any(AbortSignal),
    );
    expect(screen.getByText('Items 1-25 / 60')).toBeTruthy();
  });

  it('does not show the footer when there is no result, and shows it again with rows', async () => {
    renderNav({ searchable: true });
    await loaded();

    expect(screen.getByText('Page Size')).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'zzz' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), { key: 'Enter' });

    expect(await screen.findByText('No results found')).toBeTruthy();
    expect(screen.queryByText('Page Size')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
    expect(screen.queryByText('Items 1-10 / 60')).toBeNull();

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), { key: 'Escape' });

    expect(await screen.findByText('Page Size')).toBeTruthy();
  });

  it('shows the footer only when at least one data row is shown, also not during the first load', async () => {
    renderNav();

    // first load: no row yet, so no footer
    expect(screen.queryByText('Page Size')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();

    await loaded();

    expect(screen.getByText('Page Size')).toBeTruthy();
  });

  it('keeps the footer while the rows of a page are replaced by a new load', async () => {
    let calls = 0;
    const source = (query: Spec.Query) =>
      ++calls === 1 ? createSource()(query) : new Promise<Spec.Result<Person>>(() => {});

    renderNav({ source });
    await loaded();

    click('Next page');

    expect(screen.getByText('Page Size')).toBeTruthy();
    expect(screen.getByText('Person 01')).toBeTruthy();
  });

  it('shows no action column and no details toggle column when no data row is shown', async () => {
    const { container } = renderNav({
      selection: 'multi',
      source: async () => ({ rows: [], total: 0 }),
      renderDetail: () => <span>detail</span>,
      actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
    });

    await screen.findByText('No data');

    const template = container.querySelector<HTMLElement>('[role="table"]')?.style.gridTemplateColumns;

    // only the selection column is left besides the two data columns: one max-content, no action column
    expect(template).toBe('max-content minmax(0, 1fr) minmax(0, 1fr)');
    expect(container.querySelector('[data-divider="start"]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Show all details' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
    // the dividers live in the body, so without a data row there is none at all
    expect(container.querySelectorAll('[data-divider="end"]')).toHaveLength(0);
  });

  it('shows the action column and the details toggle column as soon as data rows are shown', async () => {
    const { container } = renderNav({
      selection: 'multi',
      renderDetail: () => <span>detail</span>,
      actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
    });

    // first load: no row yet
    expect(container.querySelector('[data-divider="start"]')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Show all details' })).toBeNull();

    await loaded();

    expect(container.querySelectorAll('[data-divider="start"]')).toHaveLength(10);
    expect(screen.getByRole('button', { name: 'Show all details' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(10);
  });

  it('does not show the footer for a source without rows', async () => {
    renderNav({ source: async () => ({ rows: [], total: 0 }) });

    expect(await screen.findByText('No data')).toBeTruthy();
    expect(screen.queryByText('Page Size')).toBeNull();
  });

  it('shows an empty text when there are no rows', async () => {
    renderNav({ source: async () => ({ rows: [], total: 0 }) });

    expect(await screen.findByText('No data')).toBeTruthy();
  });

  it('shows an icon above the default empty text', async () => {
    const { container } = renderNav({ source: async () => ({ rows: [], total: 0 }) });

    expect(await screen.findByText('No data')).toBeTruthy();

    expect(container.querySelector('.emptyIcon')).not.toBeNull();
  });

  it('replaces the default icon and text with custom empty content', async () => {
    const { container } = renderNav({ source: async () => ({ rows: [], total: 0 }), empty: <p>Nobody here yet</p> });

    expect(await screen.findByText('Nobody here yet')).toBeTruthy();

    expect(screen.queryByText('No data')).toBeNull();

    expect(container.querySelector('.emptyIcon')).toBeNull();
  });

  it('shows the empty content only when there are no rows', async () => {
    renderNav({ empty: <p>Nobody here yet</p> });

    await loaded();

    expect(screen.queryByText('Nobody here yet')).toBeNull();

    expect(screen.queryByText('No data')).toBeNull();
  });

  describe('column filters', () => {
    const filteredColumns: readonly Spec.Column<Person>[] = [
      { key: 'name', header: 'Name', filter: textColumnFilter() },

      { key: 'city', header: 'City', filter: selectColumnFilter({ options: ['Vienna', 'Berlin'] }) },
    ];

    const nameBox = () => screen.getByRole('textbox', { name: 'Name' });

    const typeName = (text: string) => fireEvent.change(nameBox(), { target: { value: text } });

    const enter = () => fireEvent.keyDown(nameBox(), { key: 'Enter' });

    // The clear control of the filter of the column with this header (other filters may have a hidden one too).
    const clickClear = (header: string) => {
      const cell = screen.getByLabelText(header).closest<HTMLElement>('.filterCell')!;
      const clear = within(cell).getByLabelText('Clear filter');

      fireEvent.mouseDown(clear);
      fireEvent.click(clear);
    };

    const filteredWith = (source: ReturnType<typeof createSource>, filters: Spec.Query['filters'], timeout = 1000) =>
      waitFor(
        () => expect(source).toHaveBeenLastCalledWith(expect.objectContaining({ filters }), expect.any(AbortSignal)),
        { timeout },
      );

    it('has no filter row when no column has a filter', async () => {
      const { container } = renderNav();

      await loaded();

      expect(container.querySelector('.filterCell')).toBeNull();

      expect(container.querySelector('.headerRow[data-filters]')).toBeNull();
    });

    it('shows the filter row in the sticky header, with one cell per column and the header as accessible name', async () => {
      const { container } = renderNav({ columns: filteredColumns });

      await loaded();

      const header = container.querySelector('.headerRow[data-filters]')!;

      expect(header).not.toBeNull();

      expect(header.querySelectorAll('.filterCell')).toHaveLength(2);

      expect(nameBox()).toBeTruthy();

      expect(screen.getByLabelText('City')).toBeTruthy();
    });

    it('shows the localized default placeholder in a text filter, or the one of the app', async () => {
      renderNav({
        columns: [
          { key: 'name', header: 'Name', filter: textColumnFilter() },
          { key: 'city', header: 'City', filter: textColumnFilter({ placeholder: 'e.g. Vienna' }) },
        ],
      });

      await loaded();

      expect(screen.getByRole('textbox', { name: 'Name' }).getAttribute('placeholder')).toBe('Filter');

      expect(screen.getByRole('textbox', { name: 'City' }).getAttribute('placeholder')).toBe('e.g. Vienna');
    });

    it('gives the selection, details and action columns empty cells in the filter row, with the dividers', async () => {
      const { container } = renderNav({
        columns: filteredColumns,

        selection: 'multi',

        renderDetail: () => <span>detail</span>,

        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: () => {} }],
      });

      await loaded();

      const cells = [...container.querySelectorAll('.headerRow .filterCell')];

      // 2 columns, the selection column, the details column and the action column

      expect(cells).toHaveLength(5);

      expect(cells.filter((cell) => cell.getAttribute('role') === 'presentation')).toHaveLength(3);

      // the filter row belongs to the header band, which has no vertical lines
      expect(cells.filter((cell) => cell.hasAttribute('data-divider'))).toHaveLength(0);

      // every filter cell sits in the grid row below the column headers (one header row here, so row 2)
      expect(cells.map((cell) => (cell as HTMLElement).style.gridRow)).toEqual(['2', '2', '2', '2', '2']);
    });

    it('does not apply a text filter while typing, only on Enter, and goes back to the first page', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();

      click('Next page');

      await loaded();

      const calls = source.mock.calls.length;

      typeName('person 0');

      // neither a pause in typing nor leaving the input applies it

      await new Promise((resolve) => setTimeout(resolve, 450));

      fireEvent.blur(nameBox());

      expect(source.mock.calls.length).toBe(calls);

      enter();

      await filteredWith(source, { name: 'person 0' }, 200);

      await loaded();

      expect(source).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }), expect.any(AbortSignal));

      expect(screen.getByText('Items 1-9 / 9')).toBeTruthy();
    });

    it('applies a text filter at once on Enter, trimmed', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();

      typeName('  person 07  ');

      enter();

      await filteredWith(source, { name: 'person 07' }, 200);
    });

    it('removes a text filter with Escape, with its clear button and when the input is emptied', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();

      typeName('person 07');

      enter();

      await filteredWith(source, { name: 'person 07' }, 200);

      await loaded();

      fireEvent.keyDown(nameBox(), { key: 'Escape' });

      await filteredWith(source, {}, 200);

      expect((nameBox() as HTMLInputElement).value).toBe('');

      await loaded();

      typeName('person 08');

      enter();

      await filteredWith(source, { name: 'person 08' }, 200);

      await loaded();

      clickClear('Name');

      await filteredWith(source, {}, 200);

      await loaded();

      typeName('person 09');

      enter();

      await filteredWith(source, { name: 'person 09' }, 200);

      await loaded();

      typeName('');

      await filteredWith(source, {}, 200);
    });

    it('does not load again for an equal value', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();

      typeName('person 07');

      enter();

      await filteredWith(source, { name: 'person 07' }, 200);

      await loaded();

      const calls = source.mock.calls.length;

      // the same value once trimmed: no new load

      typeName('person 07 ');

      enter();

      await new Promise((resolve) => setTimeout(resolve, 450));

      expect(source.mock.calls.length).toBe(calls);
    });

    it('applies a select filter at once, and removes it with its clear control', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();

      await chooseFilterOption('City', 'Vienna');

      await filteredWith(source, { city: 'Vienna' }, 200);

      await loaded();

      clickClear('City');

      await filteredWith(source, {}, 200);
    });

    it('gives a multiple select filter an array of strings, and removes the key when nothing is selected', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        {
          key: 'city',

          header: 'City',

          filter: selectColumnFilter({ options: ['Vienna', 'Berlin'], multiple: true }),
        },
      ];

      const { source } = renderNav({ columns });

      await loaded();

      await chooseFilterOption('City', 'Vienna');

      await filteredWith(source, { city: ['Vienna'] }, 300);

      await loaded();

      await chooseFilterOption('City', 'Berlin');

      await filteredWith(source, { city: ['Vienna', 'Berlin'] }, 300);
    });

    it('shows the placeholder of a select filter only while nothing is selected', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        { key: 'city', header: 'City', filter: selectColumnFilter({ options: ['Vienna', 'Berlin'] }) },
        {
          key: 'name',
          header: 'Name',
          filter: selectColumnFilter({ options: ['Ann', 'Bob'], multiple: true }),
        },
      ];

      renderNav({ columns });

      await loaded();

      expect([shownIn('City'), shownIn('Name')]).toEqual(['All', 'All']);

      await chooseFilterOption('City', 'Vienna');

      expect([shownIn('City'), shownIn('Name')]).toEqual(['Vienna', 'All']);

      await chooseFilterOption('Name', 'Ann');

      expect([shownIn('City'), shownIn('Name')]).toEqual(['Vienna', 'Ann']);
    });

    it('gives a date range filter the range of its date picker, shows it formatted, and clears it', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        { key: 'city', header: 'Moved in', filter: dateRangeColumnFilter() },
      ];

      const { source } = renderNav({ columns });

      await loaded();

      const trigger = screen.getByRole('button', { name: 'Moved in' });

      expect(trigger.textContent).toBe('All');

      fireEvent.click(trigger);

      // The date picker of @local/calendar, loaded on first use and registered under a generated tag name.
      const picker = await waitFor(() => {
        const element = [...document.querySelectorAll('*')].find((node) =>
          node.localName.startsWith('datnav-date-picker-')
        );

        expect(element).toBeDefined();

        return element as HTMLElement & { value: string };
      });

      // What the picker reports after the second click of a range.
      picker.value = '2026-09-01,2026-09-20';
      picker.dispatchEvent(new Event('change'));

      await filteredWith(source, { city: { from: '2026-09-01', to: '2026-09-20' } }, 300);

      expect(trigger.textContent).toMatch(/^Sep 1\s–\s20, 2026$/);

      await loaded();

      clickClear('Moved in');

      await filteredWith(source, {}, 300);

      expect(trigger.textContent).toBe('All');
    });

    it('clears the selection when a filter is applied', async () => {
      renderNav({ columns: filteredColumns, selection: 'multi' });

      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      expect(screen.getByText('1 selected')).toBeTruthy();

      typeName('person 0');

      enter();

      await loaded();

      await waitFor(() => expect(screen.queryByText('1 selected')).toBeNull());
    });

    it('keeps the filter inputs usable while loading and blocks the rest of the table', async () => {
      let calls = 0;

      const source = (query: Spec.Query) =>
        ++calls === 1 ? createSource()(query) : new Promise<Spec.Result<Person>>(() => {});

      renderNav({ columns: filteredColumns, source });

      await loaded();

      // a new filter starts a load that never ends

      typeName('person');

      enter();

      expect(nameBox().closest('[inert]')).toBeNull();

      expect(screen.getByLabelText('City').closest('[inert]')).toBeNull();

      expect(screen.getByRole('columnheader', { name: 'City' }).closest('[inert]')).not.toBeNull();

      expect(screen.getByText('Person 01').closest('[inert]')).not.toBeNull();

      expect(screen.getByRole('button', { name: 'Next page' }).closest('[inert]')).not.toBeNull();
    });

    it('keeps the filter row when the filters find nothing, and says that nothing was found', async () => {
      renderNav({ columns: filteredColumns });

      await loaded();

      typeName('zzz');

      enter();

      expect(await screen.findByText('No results found')).toBeTruthy();

      expect(nameBox()).toBeTruthy();

      expect(screen.queryByText('Page Size')).toBeNull();
    });
  });

  describe('search', () => {
    const searchBox = () => screen.getByRole('textbox', { name: 'Search' });

    const type = (text: string) => fireEvent.change(searchBox(), { target: { value: text } });

    const enter = () => fireEvent.keyDown(searchBox(), { key: 'Enter' });

    const searchedFor = (search: string, timeout = 1000) =>
      waitFor(
        () => expect(source).toHaveBeenLastCalledWith(expect.objectContaining({ search }), expect.any(AbortSignal)),
        { timeout },
      );

    let source: ReturnType<typeof createSource>;

    it('has a search box only when the component is searchable', async () => {
      renderNav();

      await loaded();

      expect(screen.queryByRole('textbox', { name: 'Search' })).toBeNull();
    });

    it('puts the search box right of the action buttons (at the right end of the bar)', async () => {
      renderNav({ searchable: true, actions: [{ type: 'general', key: 'add', label: 'Add', onClick: vi.fn() }] });

      await loaded();

      const add = screen.getByRole('button', { name: 'Add' });

      expect(add.compareDocumentPosition(searchBox()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('does not search while typing, only on Enter, and goes back to the first page', async () => {
      ({ source } = renderNav({ searchable: true }));

      await loaded();

      click('Next page');

      await loaded();

      const calls = source.mock.calls.length;

      type('person 0');

      // neither a pause in typing nor leaving the box searches
      await new Promise((resolve) => setTimeout(resolve, 450));
      fireEvent.blur(searchBox());

      expect(source.mock.calls.length).toBe(calls);

      enter();

      await searchedFor('person 0', 200);

      await loaded();

      expect(source).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'person 0', page: 1 }),
        expect.any(AbortSignal),
      );

      expect(screen.getByText('Items 1-9 / 9')).toBeTruthy();
    });

    it('searches at once on Enter, and trims the text', async () => {
      ({ source } = renderNav({ searchable: true }));

      await loaded();

      type('  person 07  ');

      enter();

      await searchedFor('person 07', 200);
    });

    it('clears the search on Escape and when the box is emptied, at once', async () => {
      ({ source } = renderNav({ searchable: true }));

      await loaded();

      type('person 07');

      enter();

      await searchedFor('person 07', 200);

      await loaded();

      fireEvent.keyDown(searchBox(), { key: 'Escape' });

      await searchedFor('', 200);

      expect((searchBox() as HTMLInputElement).value).toBe('');

      await loaded();

      type('person 08');

      enter();

      await searchedFor('person 08', 200);

      await loaded();

      type('');

      await searchedFor('', 200);
    });

    it('clears the selection when the search changes', async () => {
      renderNav({ searchable: true, selection: 'multi' });

      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      expect(screen.getByText('1 selected')).toBeTruthy();

      type('person 0');

      enter();

      await loaded();

      await waitFor(() => expect(screen.queryByText('1 selected')).toBeNull());
    });

    it('says that nothing was found for the search, unless custom empty content is given', async () => {
      const first = renderNav({ searchable: true });

      await loaded();

      type('zzz');

      enter();

      expect(await screen.findByText('No results found')).toBeTruthy();

      first.unmount();

      renderNav({ searchable: true, empty: <p>Custom empty content</p> });

      await loaded();

      type('zzz');

      enter();

      expect(await screen.findByText('Custom empty content')).toBeTruthy();

      expect(screen.queryByText('No results found')).toBeNull();
    });

    it('keeps the search box usable while loading and blocks everything else', async () => {
      let calls = 0;
      const source = (query: Spec.Query) =>
        ++calls === 1 ? createSource()(query) : new Promise<Spec.Result<Person>>(() => {});

      renderNav({
        searchable: true,
        source,
        actions: [{ type: 'general', key: 'add', label: 'Add', onClick: vi.fn() }],
      });
      await loaded();

      // a new search starts a load that never ends: the old rows and the footer are still shown
      fireEvent.change(searchBox(), { target: { value: 'person' } });
      fireEvent.keyDown(searchBox(), { key: 'Enter' });

      expect(searchBox().closest('[inert]')).toBeNull();
      expect(screen.getByRole('button', { name: 'Add' }).closest('[inert]')).not.toBeNull();
      expect(screen.getByRole('button', { name: 'Next page' }).closest('[inert]')).not.toBeNull();
    });
  });

  describe('selection mode from the actions', () => {
    const noop = () => {};

    const controls = () => ({
      checkboxes: screen.queryAllByRole('checkbox').length,

      radios: screen.queryAllByRole('radio').length,
    });

    it('has checkboxes (multi) for a rows action, although its button is not visible yet', async () => {
      renderNav({ actions: [{ type: 'rows', key: 'del', label: 'Delete', onClick: noop }] });

      await loaded();

      // the mode depends on the definitions, not on what is visible at the moment

      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();

      expect(controls()).toEqual({ checkboxes: 11, radios: 0 });
    });

    it('has checkboxes (multi) for a rows action inside a menu', async () => {
      renderNav({
        actions: [{
          type: 'menu',

          key: 'more',

          label: 'More',

          actions: [{ type: 'rows', key: 'archive', label: 'Archive', onClick: noop }],
        }],
      });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 11, radios: 0 });
    });

    it('has radio buttons (single) for a row action in the toolbar, also when it is shown in both places', async () => {
      renderNav({ actions: [{ type: 'row', key: 'open', label: 'Open', show: 'toolbar', onClick: noop }] });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 10 });

      cleanup();

      renderNav({ actions: [{ type: 'row', key: 'open', label: 'Open', show: 'both', onClick: noop }] });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 10 });
    });

    it('has radio buttons (single) for a toolbar row action inside a menu', async () => {
      renderNav({
        actions: [{
          type: 'menu',

          key: 'more',

          label: 'More',

          actions: [{ type: 'row', key: 'open', label: 'Open', show: 'toolbar', onClick: noop }],
        }],
      });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 10 });
    });

    it('has no selection for general actions and for row actions that only live in the action column', async () => {
      renderNav({
        actions: [
          { type: 'general', key: 'add', label: 'Add', onClick: noop },

          { type: 'row', key: 'edit', label: 'Edit', onClick: noop },

          { type: 'row', key: 'view', label: 'View', show: 'column', onClick: noop },
        ],
      });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 0 });
    });

    it('has no selection without actions', async () => {
      renderNav();

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 0 });
    });

    it('prefers multi when rows actions and toolbar row actions are mixed', async () => {
      renderNav({
        actions: [
          { type: 'row', key: 'open', label: 'Open', show: 'toolbar', onClick: noop },

          { type: 'rows', key: 'del', label: 'Delete', onClick: noop },
        ],
      });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 11, radios: 0 });
    });
  });

  describe('selection', () => {
    it('selects rows with checkboxes and clears the selection when the page changes', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      expect(screen.getByText('1 selected')).toBeTruthy();

      click('Next page');
      await loaded();

      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('selects all rows of the page with the header checkbox', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      fireEvent.click(screen.getByRole('checkbox', { name: 'Select all rows' }));
      expect(screen.getByText('10 selected')).toBeTruthy();

      fireEvent.click(screen.getByRole('checkbox', { name: 'Deselect all rows' }));
      expect(screen.queryByText('10 selected')).toBeNull();
    });

    it('clears the selection when the sorting changes', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      click('Name');
      await loaded();

      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('allows only one selected row with radio buttons', async () => {
      renderNav({ selection: 'single' });
      await loaded();

      fireEvent.click(screen.getAllByRole('radio', { name: 'Select row' })[0]!);
      fireEvent.click(screen.getAllByRole('radio', { name: 'Select row' })[0]!);

      const checked = screen.getAllByRole('radio').filter((radio) => (radio as HTMLInputElement).checked);

      expect(checked).toHaveLength(1);
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(screen.queryByRole('checkbox')).toBeNull();
    });

    it('has no selection controls by default', async () => {
      renderNav();
      await loaded();

      expect(screen.queryByRole('checkbox')).toBeNull();
      expect(screen.queryByRole('radio')).toBeNull();
    });
  });

  // Row click selects only on the free space of a cell, never on the text itself: the text has its own element.
  const cellOf = (text: string) => screen.getByText(text).closest<HTMLElement>('[role="cell"]')!;
  const clickCell = (text: string, init?: MouseEventInit) => fireEvent.click(cellOf(text), init);
  // What a browser really fires for a double click. The second mouse down already carries detail 2: that is where
  // the browser first says it is a double click, before the second click and the double click event.
  const doubleClickCell = (text: string) => {
    const cell = cellOf(text);

    fireEvent.click(cell, { detail: 1 });
    fireEvent.mouseDown(cell, { detail: 2 });
    fireEvent.click(cell, { detail: 2 });
    fireEvent.doubleClick(cell, { detail: 2 });
  };

  describe('row click', () => {
    it('selects only on the free space of a cell, never on its text or on custom content', async () => {
      const { container } = renderNav({
        selection: 'multi',
        columns: [
          { key: 'name', header: 'Name' },
          { key: 'city', header: 'City', render: (person) => <em>{person.city}</em> },
        ],
      });
      await loaded();

      // the plain text of a cell has an element of its own, so a click on it is not a click on the cell
      const text = screen.getByText('Person 01');

      expect(text.getAttribute('role')).toBeNull();
      expect(text.closest('[role="cell"]')).not.toBe(text);

      fireEvent.click(text);
      expect(screen.queryByText('1 selected')).toBeNull();

      // nor is a click on what a custom `render` drew
      fireEvent.click(screen.getAllByText('Vienna')[0]!);
      expect(screen.queryByText('1 selected')).toBeNull();

      // the free space of the cell does select
      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();

      expect(container.querySelector('.dataRow > [data-control]')).toBeNull();
    });

    it('selects from the free space of the meta cells, but never from the action cell', async () => {
      const { container } = renderNav({
        selection: 'multi',
        renderDetail: (person) => <span>{`detail ${person.id}`}</span>,
        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });
      await loaded();

      const cellsOfFirstRow = [...container.querySelector('.dataRow')!.children] as HTMLElement[];
      const [selectionCell, detailsCell] = cellsOfFirstRow;
      const actionCell = cellsOfFirstRow[cellsOfFirstRow.length - 1]!;

      // only the action cell is a control cell, so the pointer rule covers the other two
      expect(selectionCell!.matches('.cell:not([data-control])')).toBe(true);
      expect(detailsCell!.matches('.cell:not([data-control])')).toBe(true);
      expect(actionCell.matches('.cell:not([data-control])')).toBe(false);

      // the selection cell selects and deselects from its free space
      fireEvent.click(selectionCell!);
      expect(screen.getByText('1 selected')).toBeTruthy();

      fireEvent.click(selectionCell!);
      expect(screen.queryByText('1 selected')).toBeNull();

      // so does the details toggle cell, without expanding anything
      fireEvent.click(detailsCell!);
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(screen.queryByText('detail 1')).toBeNull();

      // the chevron inside it still only expands, and does not change the selection
      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
      expect(screen.getByText('detail 1')).toBeTruthy();
      expect(screen.getByText('1 selected')).toBeTruthy();

      // the checkbox toggles exactly once, not twice through the cell as well
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Deselect row' })[0]!);
      expect(screen.queryByText('1 selected')).toBeNull();

      // the action cell never selects
      fireEvent.click(actionCell);
      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('selects from the free space of a detail row too, but not from its content', async () => {
      const { container } = renderNav({
        selection: 'multi',
        renderDetail: (person) => <span>{`detail ${person.id}`}</span>,
      });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);

      const detailRow = screen.getByText('detail 1').closest<HTMLElement>('.detailRow')!;
      const detailCell = screen.getByText('detail 1').closest<HTMLElement>('[role="cell"]')!;

      // what `renderDetail` drew is its own target, so it does not select
      fireEvent.click(screen.getByText('detail 1'));
      expect(screen.queryByText('1 selected')).toBeNull();

      // the free space of the detail cell does
      fireEvent.click(detailCell);
      expect(screen.getByText('1 selected')).toBeTruthy();

      // and so do the empty cells beside it, which are part of the same row
      const beside = [...detailRow.children].filter((cell) => cell !== detailCell) as HTMLElement[];

      expect(beside.length).toBeGreaterThan(0);

      fireEvent.click(beside[0]!);
      expect(screen.queryByText('1 selected')).toBeNull();

      // the detail row selects the row it belongs to, not another one
      fireEvent.click(detailCell);
      expect(container.querySelectorAll('.dataRow[aria-selected="true"]')).toHaveLength(1);
    });

    it('toggles the row in multi mode', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();

      clickCell('Person 02');
      expect(screen.getByText('2 selected')).toBeTruthy();

      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('selects the row in single mode and keeps it selected when clicked again', async () => {
      renderNav({ selection: 'single' });
      await loaded();

      clickCell('Person 01');
      clickCell('Person 01');

      const radios = screen.getAllByRole('radio') as HTMLInputElement[];

      expect(radios[0]?.checked).toBe(true);
      expect(screen.getByText('1 selected')).toBeTruthy();

      clickCell('Person 02');

      expect(radios.filter((radio) => radio.checked)).toHaveLength(1);
      expect(radios[1]?.checked).toBe(true);
    });

    it('does nothing without a selection mode', async () => {
      const { container } = renderNav();
      await loaded();

      clickCell('Person 01');

      expect(screen.queryByText('1 selected')).toBeNull();
      expect(container.querySelector('[role="row"][aria-selected]')).toBeNull();
    });

    it('ignores clicks on buttons and links inside a cell', async () => {
      renderNav({
        selection: 'multi',
        columns: [
          { key: 'name', header: 'Name' },
          {
            key: 'city',
            header: 'City',
            render: (person) => (
              <>
                <button type="button">{`open ${person.id}`}</button>
                <a href="#top">{`link ${person.id}`}</a>
              </>
            ),
          },
        ],
      });
      await loaded();

      fireEvent.click(screen.getByRole('button', { name: 'open 1' }));
      fireEvent.click(screen.getByRole('link', { name: 'link 1' }));

      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('ignores clicks in the action column and in the details column', async () => {
      renderNav({
        selection: 'multi',
        renderDetail: (person) => <span>{`detail ${person.id}`}</span>,
        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]!);
      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
      fireEvent.click(screen.getByText('detail 1'));

      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('does not select a row when a menu item of an open menu is clicked', async () => {
      const onArchive = vi.fn();

      renderNav({
        selection: 'multi',
        actions: [{
          type: 'menu',
          key: 'more',
          label: 'More',
          actions: [{ type: 'row', key: 'archive', label: 'Archive', onClick: onArchive }],
        }],
      });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'More' })[0]!);
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Archive' }));

      expect(onArchive).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('ignores a click that ends a text selection', async () => {
      const selection = vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => 'Pers' } as Selection);

      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 01');
      expect(screen.queryByText('1 selected')).toBeNull();

      selection.mockRestore();
      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('does not select a row when its expanded detail is clicked', async () => {
      renderNav({ selection: 'multi', renderDetail: (person) => <span>{`detail ${person.id}`}</span> });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
      fireEvent.click(screen.getByText('detail 1'));

      expect(screen.queryByText('1 selected')).toBeNull();
    });
  });

  describe('double click (the default action)', () => {
    const editAction = (onClick: () => void) => ({
      type: 'row' as const,
      key: 'edit',
      label: 'Edit',
      default: true,
      onClick,
    });

    it('runs the default action on the free space of a row, with that row', async () => {
      const edit = vi.fn();

      renderNav({ selection: 'multi', actions: [editAction(edit)] });
      await loaded();

      // not on the text of a cell, which is its own target
      fireEvent.doubleClick(screen.getByText('Person 01'));
      expect(edit).not.toHaveBeenCalled();

      doubleClickCell('Person 02');
      expect(edit).toHaveBeenCalledTimes(1);
      expect(edit.mock.calls[0]![0]).toMatchObject({ name: 'Person 02' });
    });

    it('puts the selection back on the second mouse down, before the double click is reported', async () => {
      const edit = vi.fn();

      renderNav({ selection: 'multi', actions: [editAction(edit)] });
      await loaded();

      const cell = cellOf('Person 01');

      // the first click selects at once: there is no waiting and no guessed threshold anywhere
      fireEvent.click(cell, { detail: 1 });
      expect(screen.getByText('1 selected')).toBeTruthy();

      // the browser marks the second mouse down as one of a double click, and the selection goes back there,
      // before the click and the double click that follow it
      fireEvent.mouseDown(cell, { detail: 2 });
      expect(screen.queryByText('1 selected')).toBeNull();
      expect(edit).not.toHaveBeenCalled();

      fireEvent.click(cell, { detail: 2 });
      fireEvent.doubleClick(cell, { detail: 2 });
      expect(edit).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('leaves the rest of the selection alone, in multi mode', async () => {
      const edit = vi.fn();

      renderNav({ selection: 'multi', actions: [editAction(edit)] });
      await loaded();

      clickCell('Person 02');
      expect(screen.getByText('1 selected')).toBeTruthy();

      // a double click on another row runs the action and leaves Person 02 selected, alone
      doubleClickCell('Person 01');
      expect(edit).toHaveBeenCalledTimes(1);
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(cellOf('Person 02').closest('[role="row"]')?.getAttribute('aria-selected')).toBe('true');
      expect(cellOf('Person 01').closest('[role="row"]')?.getAttribute('aria-selected')).toBe('false');

      // and a double click on the selected row leaves it selected
      doubleClickCell('Person 02');
      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('selects at once on a plain click: a default action costs no delay', async () => {
      renderNav({ selection: 'multi', actions: [editAction(vi.fn())] });
      await loaded();

      // no timers are involved: the row reacts in the same tick as the click
      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();

      clickCell('Person 02');
      expect(screen.getByText('2 selected')).toBeTruthy();
    });

    it('leaves the selected row as it was, in single mode', async () => {
      const edit = vi.fn();

      renderNav({ actions: [{ ...editAction(edit), show: 'toolbar' as const }] });
      await loaded();

      expect(screen.getAllByRole('radio')).not.toHaveLength(0);

      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();

      // the double click runs the action but does not move the selection to Person 02
      doubleClickCell('Person 02');

      expect(edit).toHaveBeenCalledTimes(1);
      expect(edit.mock.calls[0]![0]).toMatchObject({ name: 'Person 02' });
      expect(cellOf('Person 01').closest('[role="row"]')?.getAttribute('aria-selected')).toBe('true');
      expect(cellOf('Person 02').closest('[role="row"]')?.getAttribute('aria-selected')).toBe('false');
    });

    it('works without a selection mode and from a detail row', async () => {
      const edit = vi.fn();

      renderNav({
        actions: [editAction(edit)],
        renderDetail: (person) => <span>{`detail ${person.id}`}</span>,
      });
      await loaded();

      expect(screen.queryByRole('checkbox', { name: 'Select row' })).toBeNull();

      doubleClickCell('Person 01');
      expect(edit).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
      fireEvent.doubleClick(screen.getByText('detail 1').closest<HTMLElement>('[role="cell"]')!);
      expect(edit).toHaveBeenCalledTimes(2);
    });

    it('does nothing without an action marked default, and takes the first one that is', async () => {
      const plain = vi.fn();

      const { unmount } = renderNav({
        selection: 'multi',
        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: plain }],
      });
      await loaded();

      doubleClickCell('Person 01');
      expect(plain).not.toHaveBeenCalled();

      unmount();

      const first = vi.fn();
      const second = vi.fn();

      renderNav({
        selection: 'multi',
        actions: [
          { type: 'row', key: 'a', label: 'A', default: true, onClick: first },
          { type: 'row', key: 'b', label: 'B', default: true, onClick: second },
        ],
      });
      await loaded();

      doubleClickCell('Person 01');
      expect(first).toHaveBeenCalledTimes(1);
      expect(second).not.toHaveBeenCalled();
    });

    it('still runs while the browser has a text selection, which a double click itself makes', async () => {
      const edit = vi.fn();

      renderNav({ selection: 'multi', actions: [editAction(edit)] });
      await loaded();

      // jsdom has no text selection: a real browser selects a word on a double click, so by the time it fires,
      // `getSelection()` is not empty. The single click guards on that, the double click must not.
      const selected = vi.spyOn(window, 'getSelection')
        .mockReturnValue({ toString: () => 'Person 01' } as Selection);

      try {
        clickCell('Person 01');
        expect(screen.queryByText('1 selected')).toBeNull();

        fireEvent.doubleClick(cellOf('Person 01'));
        expect(edit).toHaveBeenCalledTimes(1);
      } finally {
        selected.mockRestore();
      }
    });

    it('stops the browser selecting a word, but only where the double click does something', async () => {
      renderNav({ selection: 'multi', actions: [editAction(vi.fn())] });
      await loaded();

      const down = (element: HTMLElement, detail: number) => fireEvent.mouseDown(element, { detail });

      // the second mouse down on the free space of a cell: no word selection behind what the action opens
      expect(down(cellOf('Person 01'), 2)).toBe(false);

      // on the text itself the double click does nothing, so a word can still be selected and copied
      expect(down(screen.getByText('Person 01'), 2)).toBe(true);

      // a single mouse down is never suppressed
      expect(down(cellOf('Person 01'), 1)).toBe(true);
    });

    it('leaves the word selection alone when no action is marked default', async () => {
      renderNav({ actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }] });
      await loaded();

      expect(fireEvent.mouseDown(cellOf('Person 01'), { detail: 2 })).toBe(true);
    });

    it('finds the default action inside a menu as well', async () => {
      const edit = vi.fn();

      renderNav({
        selection: 'multi',
        actions: [{ type: 'menu', key: 'more', label: 'More', actions: [editAction(edit)] }],
      });
      await loaded();

      doubleClickCell('Person 01');
      expect(edit).toHaveBeenCalledTimes(1);
    });
  });

  describe('block selection (shift + click)', () => {
    const shiftClick = (text: string) => clickCell(text, { shiftKey: true });

    it('selects the range from the anchor row to the shift-clicked row', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 02');
      shiftClick('Person 05');

      expect(screen.getByText('4 selected')).toBeTruthy();
    });

    it('works upwards as well', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 05');
      shiftClick('Person 02');

      expect(screen.getByText('4 selected')).toBeTruthy();
    });

    it('gives the range the state of the anchor row, like Gmail', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 02');
      shiftClick('Person 05');
      expect(screen.getByText('4 selected')).toBeTruthy();

      clickCell('Person 03');
      expect(screen.getByText('3 selected')).toBeTruthy();

      shiftClick('Person 05');
      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('keeps the rows outside the range and makes the shift-clicked row the new anchor', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 01');
      clickCell('Person 04');
      shiftClick('Person 06');
      expect(screen.getByText('4 selected')).toBeTruthy();

      shiftClick('Person 08');
      expect(screen.getByText('6 selected')).toBeTruthy();
    });

    it('works with the checkboxes of the rows', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      const boxes = () => screen.getAllByRole('checkbox').slice(1);

      fireEvent.click(boxes()[1]!);
      fireEvent.click(boxes()[4]!, { shiftKey: true });

      expect(screen.getByText('4 selected')).toBeTruthy();
    });

    it('behaves like a normal click without an anchor and on the anchor row itself', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      shiftClick('Person 04');
      expect(screen.getByText('1 selected')).toBeTruthy();

      shiftClick('Person 04');
      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('forgets the anchor when the page changes', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 02');
      click('Next page');
      await loaded();
      shiftClick('Person 15');

      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('is ignored in single mode', async () => {
      renderNav({ selection: 'single' });
      await loaded();

      clickCell('Person 01');
      shiftClick('Person 05');

      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('prevents the browser from selecting text on shift + mouse down', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      expect(fireEvent.mouseDown(screen.getByText('Person 01'), { shiftKey: true })).toBe(false);
      expect(fireEvent.mouseDown(screen.getByText('Person 01'))).toBe(true);
    });
  });

  describe('row details', () => {
    it('never draws a line between a data row and its detail row', async () => {
      renderNav({ selection: 'multi', renderDetail: (person) => <span>{`detail ${person.id}`}</span> });
      await loaded();

      // jsdom does not compute borders: read the rules of the stylesheet
      const rules = [...document.styleSheets]
        .flatMap((sheet) => [...sheet.cssRules])
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
      const ruleFor = (selector: string) => rules.find((rule) => rule.selectorText === selector);

      // the detail row has no top border, whatever the state, and keeps the height it had with one
      const detail = ruleFor('.detailRow > .cell');

      expect(detail?.style.borderTopStyle).toBe('none');
      expect(detail?.style.marginTop).toBe('0px');

      // and the data row above it gives up its bottom line, by color only, so nothing shifts
      const above = ruleFor('.dataRow:has(+ .detailRow) > .cell');

      expect(above?.style.borderBottomColor).toBe('transparent');
      expect(above?.style.borderBottom).toBe('');

      // both come after the selection border rules, so they win at equal weight
      const index = (rule: CSSStyleRule | undefined) => (rule === undefined ? -1 : rules.indexOf(rule));
      const selectionBorder = rules.filter((rule) =>
        rule.selectorText.includes('[data-selected]') && rule.style.borderTop !== ''
      );

      expect(selectionBorder.length).toBeGreaterThan(0);
      expect(index(detail)).toBeGreaterThan(Math.max(...selectionBorder.map((rule) => rules.indexOf(rule))));
    });

    it('highlights the detail row of a selected row, including the empty cells beside the detail', async () => {
      renderNav({
        selection: 'multi',
        renderDetail: (person) => <span>{`detail ${person.id}`}</span>,
        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);

      const cellsOfDetail = (id: number) => {
        const detail = screen.getByText(`detail ${id}`).closest<HTMLElement>('[role="cell"]')!;

        return [...detail.parentElement!.children];
      };

      // 3 empty cells and the detail cell: none is highlighted while the rows are not selected
      expect(cellsOfDetail(1)).toHaveLength(4);
      expect(cellsOfDetail(1).some((cell) => cell.hasAttribute('data-selected'))).toBe(false);

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      expect(cellsOfDetail(1).every((cell) => cell.hasAttribute('data-selected'))).toBe(true);
      expect(cellsOfDetail(2).some((cell) => cell.hasAttribute('data-selected'))).toBe(false);

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Deselect row' })[0]!);

      expect(cellsOfDetail(1).some((cell) => cell.hasAttribute('data-selected'))).toBe(false);
    });

    it('hovers a data row and its detail row together, whichever of the two is hovered', async () => {
      renderNav({ renderDetail: (person) => <span>{`detail ${person.id}`}</span> });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);

      const detailRow = screen.getByText('detail 1').closest<HTMLElement>('[role="row"]')!;
      const dataRow = detailRow.previousElementSibling as HTMLElement;
      const otherDataRow = screen.getByText('Person 02').closest<HTMLElement>('[role="row"]')!;

      // the pairing works through the neighbors: the detail row directly follows its data row
      expect(dataRow.classList.contains('dataRow')).toBe(true);
      expect(detailRow.classList.contains('detailRow')).toBe(true);
      expect(detailRow.classList.contains('dataRow')).toBe(false);

      // jsdom has no :hover, so the pointer is simulated with a class.
      const selectors = selectorsInMedia(/hover:\s*hover/)
        .filter((selector) => selector.includes('dataRow') || selector.includes('detailRow'))
        .flatMap((selector) => selector.split(/,\s*/))
        .map((selector) => selector.replaceAll(':hover', '.pointer'));

      expect(selectors.length).toBeGreaterThan(0);

      const highlighted = (hovered: HTMLElement) => {
        hovered.classList.add('pointer');

        const cells = new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]));

        hovered.classList.remove('pointer');

        return cells;
      };

      const cellsOf = (row: HTMLElement) => [...row.querySelectorAll('.cell')];
      const pair = [...cellsOf(dataRow), ...cellsOf(detailRow)];

      for (const hovered of [dataRow, detailRow]) {
        const cells = highlighted(hovered);

        // every cell of both rows is highlighted, whichever of the two rows is hovered ...
        expect(pair.length).toBeGreaterThan(0);
        expect(pair.every((cell) => cells.has(cell))).toBe(true);
        // ... and nothing of any other row
        expect(cellsOf(otherDataRow).some((cell) => cells.has(cell))).toBe(false);
      }

      // hovering another row highlights neither of the two
      const cellsOfOther = highlighted(otherDataRow);

      expect(pair.some((cell) => cellsOfOther.has(cell))).toBe(false);

      // the hover color wins over the selection color: selected cells are highlighted too
      for (const cell of pair) {
        cell.setAttribute('data-selected', '');
      }

      expect(pair.every((cell) => highlighted(dataRow).has(cell))).toBe(true);
    });

    it('lets the detail cell span only the data columns, with empty cells beside it', async () => {
      renderNav({
        selection: 'multi',
        renderDetail: () => <span>the detail</span>,
        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);

      const detail = screen.getByText('the detail').closest<HTMLElement>('[role="cell"]')!;
      const beside = detail.parentElement!.querySelectorAll('[role="presentation"]');

      // selection column and details column come first: the data columns start at column 3, and there are 2 of them
      expect(detail.style.gridColumn).toBe('3 / span 2');
      expect(beside).toHaveLength(3);
    });

    const renderDetail = (person: Person) => (person.id % 2 === 0 ? <span>{`detail ${person.id}`}</span> : null);

    it('shows a chevron only for rows that have details', async () => {
      renderNav({ renderDetail });
      await loaded();

      expect(screen.getAllByRole('button', { name: 'Show details' })).toHaveLength(5);
    });

    it('expands one row, then all rows', async () => {
      renderNav({ renderDetail });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);
      expect(screen.getByText('detail 2')).toBeTruthy();
      expect(screen.queryByText('detail 4')).toBeNull();

      click('Show all details');
      expect(screen.getByText('detail 10')).toBeTruthy();

      click('Hide all details');
      expect(screen.queryByText('detail 2')).toBeNull();
    });

    it('hides the whole chevron column when no row has details', async () => {
      renderNav({ renderDetail: () => null });
      await loaded();

      expect(screen.queryByRole('button', { name: 'Show all details' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'Show details' })).toBeNull();
    });
  });

  describe('action looks', () => {
    const noop = () => {};

    const icon = (name: string) => <span aria-hidden="true" data-testid={`icon-${name}`} />;

    it('shows only a label, or an icon in front of the label', async () => {
      renderNav({
        actions: [
          { type: 'general', key: 'plain', label: 'Plain', onClick: noop },

          { type: 'general', key: 'add', label: 'Add', icon: icon('add'), onClick: noop },
        ],
      });

      await loaded();

      expect(screen.getByRole('button', { name: 'Plain' }).querySelector('[data-testid]')).toBeNull();

      expect(screen.getByRole('button', { name: 'Add' }).querySelector('[data-testid="icon-add"]')).not.toBeNull();
    });

    it('shows an icon-only action: the tip is its accessible name and appears as a tooltip on hover', async () => {
      const onClick = vi.fn();

      renderNav({ actions: [{ type: 'general', key: 'edit', icon: icon('edit'), tip: 'Edit this user', onClick }] });

      await loaded();

      const button = screen.getByRole('button', { name: 'Edit this user' });

      expect(button.querySelector('[data-testid="icon-edit"]')).not.toBeNull();

      // no visible label, and the tooltip is not open yet

      expect(screen.queryByText('Edit this user')).toBeNull();

      hover(button);

      expect(await screen.findByText('Edit this user', {}, { timeout: 2000 })).toBeTruthy();

      fireEvent.click(button);

      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('shows the tip of a labeled action as a tooltip as well, and keeps the label as its name', async () => {
      renderNav({
        actions: [{ type: 'general', key: 'save', label: 'Save', tip: 'Save all changes', onClick: noop }],
      });

      await loaded();

      const button = screen.getByRole('button', { name: 'Save' });

      expect(screen.queryByText('Save all changes')).toBeNull();

      hover(button);

      expect(await screen.findByText('Save all changes', {}, { timeout: 2000 })).toBeTruthy();
    });

    it('works for icon-only row actions in the action column', async () => {
      const onClick = vi.fn();

      renderNav({ actions: [{ type: 'row', key: 'edit', icon: icon('edit'), tip: 'Edit user', onClick }] });

      await loaded();

      const buttons = screen.getAllByRole('button', { name: 'Edit user' });

      expect(buttons).toHaveLength(10);

      fireEvent.click(buttons[2]!);

      expect(onClick).toHaveBeenLastCalledWith(people[2]);
    });

    it('gives a menu an icon-only button, and its items an icon and a label (or the tip without a label)', async () => {
      renderNav({
        actions: [{
          type: 'menu',

          key: 'more',

          icon: icon('more'),

          tip: 'More actions',

          actions: [
            { type: 'general', key: 'export', label: 'Export', icon: icon('export'), onClick: noop },

            { type: 'general', key: 'print', icon: icon('print'), tip: 'Print it', onClick: noop },
          ],
        }],
      });

      await loaded();

      fireEvent.click(screen.getByRole('button', { name: 'More actions' }));

      const exportItem = await screen.findByRole('menuitem', { name: 'Export' });

      const printItem = await screen.findByRole('menuitem', { name: 'Print it' });

      expect(exportItem.querySelector('[data-testid="icon-export"]')).not.toBeNull();

      expect(printItem.querySelector('[data-testid="icon-print"]')).not.toBeNull();
    });

    it('requires a tip for an icon-only action (checked by the compiler)', () => {
      // @ts-expect-error an icon-only action needs a tip: without a label, nothing would name the button

      const withoutTip: Spec.GeneralAction = { type: 'general', key: 'x', icon: icon('x'), onClick: noop };

      const withTip: Spec.GeneralAction = { type: 'general', key: 'y', icon: icon('y'), tip: 'Y', onClick: noop };

      expect([withoutTip, withTip]).toHaveLength(2);
    });
  });

  describe('menu separators', () => {
    const noop = () => {};

    const general = (key: string, label: string): Spec.Action<Person> => ({
      type: 'general',
      key,
      label,
      onClick: noop,
    });

    const separator = (): Spec.ActionSeparator => ({ type: 'separator' });

    const menu = (...actions: (Spec.Action<Person> | Spec.ActionSeparator)[]): Spec.ActionMenu<Person> => ({
      type: 'menu',

      key: 'menu',

      label: 'Menu',

      actions,
    });

    const open = () => fireEvent.click(screen.getByRole('button', { name: 'Menu' }));

    it('shows a separator between visible actions', async () => {
      renderNav({ actions: [menu(general('a', 'Action A'), separator(), general('b', 'Action B'))] });

      await loaded();

      open();

      expect(await screen.findByRole('menuitem', { name: 'Action A' })).toBeTruthy();

      expect(screen.getByRole('menuitem', { name: 'Action B' })).toBeTruthy();

      expect(screen.getAllByRole('separator')).toHaveLength(1);
    });

    it('shows a separator only if a visible action follows it (a rows action is not visible without a selection)', async () => {
      const rowsAction: Spec.Action<Person> = { type: 'rows', key: 'r', label: 'Action R', onClick: noop };

      const first = renderNav({ actions: [menu(general('a', 'Action A'), separator(), rowsAction)] });

      await loaded();

      open();

      expect(await screen.findByRole('menuitem', { name: 'Action A' })).toBeTruthy();

      expect(screen.queryByRole('menuitem', { name: 'Action R' })).toBeNull();

      expect(screen.queryAllByRole('separator')).toHaveLength(0);

      first.unmount();

      renderNav({ actions: [menu(general('a', 'Action A'), separator(), rowsAction)] });

      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      open();

      expect(await screen.findByRole('menuitem', { name: 'Action R' })).toBeTruthy();

      expect(screen.getAllByRole('separator')).toHaveLength(1);
    });

    it('shows no separator at the start or at the end, and only one where several follow each other', async () => {
      renderNav({
        actions: [
          menu(
            separator(),
            general('a', 'Action A'),
            separator(),
            separator(),
            general('b', 'Action B'),
            separator(),
          ),
        ],
      });

      await loaded();

      open();

      expect(await screen.findByRole('menuitem', { name: 'Action A' })).toBeTruthy();

      expect(screen.getAllByRole('separator')).toHaveLength(1);
    });

    it('hides a menu that has no visible action, separators do not count', async () => {
      const rowsAction: Spec.Action<Person> = { type: 'rows', key: 'r', label: 'Action R', onClick: noop };

      renderNav({ actions: [menu(separator(), rowsAction)] });

      await loaded();

      expect(screen.queryByRole('button', { name: 'Menu' })).toBeNull();
    });
  });

  describe('action variants', () => {
    const variantOf = (name: string, index = 0) =>
      screen.getAllByRole('button', { name })[index]?.getAttribute('data-variant');

    it('gives actions and menus a variant, secondary by default', async () => {
      renderNav({
        actions: [
          { type: 'general', key: 'add', label: 'Add', variant: 'primary', onClick: vi.fn() },

          { type: 'general', key: 'plain', label: 'Plain', onClick: vi.fn() },

          { type: 'general', key: 'clear', label: 'Clear all', variant: 'danger', onClick: vi.fn() },

          {
            type: 'menu',

            key: 'more',

            label: 'More',

            variant: 'primary',

            actions: [{ type: 'general', key: 'export', label: 'Export', onClick: vi.fn() }],
          },

          {
            type: 'menu',
            key: 'plain-menu',
            label: 'Other',
            actions: [{ type: 'general', key: 'x', label: 'X', onClick: vi.fn() }],
          },
        ],
      });

      await loaded();

      expect(variantOf('Add')).toBe('primary');

      expect(variantOf('Plain')).toBe('secondary');

      expect(variantOf('Clear all')).toBe('danger');

      expect(variantOf('More')).toBe('primary');

      expect(variantOf('Other')).toBe('secondary');
    });

    it('applies the variant to the actions in the action column as well', async () => {
      renderNav({
        actions: [
          { type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() },

          { type: 'row', key: 'remove', label: 'Remove', variant: 'danger', onClick: vi.fn() },

          { type: 'row', key: 'open', label: 'Open', variant: 'primary', onClick: vi.fn() },
        ],
      });

      await loaded();

      expect(variantOf('Edit', 0)).toBe('secondary');

      expect(variantOf('Remove', 3)).toBe('danger');

      expect(variantOf('Open', 9)).toBe('primary');
    });

    it('still calls the action when a variant is set', async () => {
      const onClick = vi.fn();

      renderNav({ actions: [{ type: 'general', key: 'del', label: 'Delete all', variant: 'danger', onClick }] });

      await loaded();

      click('Delete all');

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('actions', () => {
    const onAdd = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const actions: readonly Spec.Action<Person>[] = [
      { type: 'general', key: 'add', label: 'Add', onClick: onAdd },
      { type: 'row', key: 'edit', label: 'Edit', show: 'both', onClick: onEdit },
      { type: 'rows', key: 'delete', label: 'Delete', onClick: onDelete },
    ];

    it('shows toolbar actions only when the matching number of rows is selected', async () => {
      renderNav({ selection: 'multi', actions });
      await loaded();

      expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
      expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(10);

      const boxes = screen.getAllByRole('checkbox', { name: 'Select row' });

      fireEvent.click(boxes[0]!);
      expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
      expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(11);

      fireEvent.click(boxes[1]!);
      expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(10);
    });

    it('passes the right rows to the actions', async () => {
      renderNav({ selection: 'multi', actions });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[2]!);
      expect(onEdit).toHaveBeenLastCalledWith(people[2]);

      fireEvent.click(screen.getByRole('button', { name: 'Add' }));
      expect(onAdd).toHaveBeenCalledTimes(1);

      const boxes = screen.getAllByRole('checkbox', { name: 'Select row' });

      fireEvent.click(boxes[0]!);
      fireEvent.click(boxes[1]!);
      click('Delete');
      expect(onDelete).toHaveBeenLastCalledWith([people[0], people[1]]);
    });

    it('lists the actions of a menu and hides a menu without visible actions', async () => {
      const menu: Spec.ActionMenu<Person> = {
        type: 'menu',
        key: 'more',
        label: 'More',
        actions: [{ type: 'rows', key: 'archive', label: 'Archive', onClick: vi.fn() }],
      };

      renderNav({ selection: 'multi', actions: [menu] });
      await loaded();

      expect(screen.queryByRole('button', { name: 'More' })).toBeNull();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      click('More');

      expect(await screen.findByRole('menuitem', { name: 'Archive' })).toBeTruthy();
    });
  });

  describe('header', () => {
    it('shows the icon of an unsorted sortable column only on hover, and keeps the arrow of the sorted one', async () => {
      renderNav({
        columns: [
          { key: 'name', header: 'Name', sortable: true },
          { key: 'city', header: 'City', sortable: true },
          { key: 'id', header: 'Id' },
        ],
      });
      await loaded();

      const iconIn = (name: string) => screen.getByRole('columnheader', { name }).querySelector('.unsortedIcon');

      expect(iconIn('Name')).not.toBeNull();
      expect(iconIn('City')).not.toBeNull();
      expect(iconIn('Id')).toBeNull();
      expect(declarationsOf('.unsortedIcon')).toMatch(/visibility:\s*hidden/);
      // devices that cannot hover always show it, since nothing could reveal it there
      expect(declarationsInMedia(/hover:\s*none/, '.unsortedIcon')).toMatch(/visibility:\s*visible/);

      click('Name');
      await loaded();

      expect(iconIn('Name')).toBeNull();
      expect(iconIn('City')).not.toBeNull();
    });

    it('makes the whole sortable header cell the click target, and only that one', async () => {
      const { source } = renderNav();
      await loaded();

      const header = screen.getByRole('columnheader', { name: /Name/ });

      expect(header.hasAttribute('data-sortable')).toBe(true);
      expect(screen.getByRole('columnheader', { name: 'City' }).hasAttribute('data-sortable')).toBe(false);

      fireEvent.click(header);
      await loaded();
      expect(source).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: { key: 'name', direction: 'asc' } }),
        expect.any(AbortSignal),
      );

      // the button inside the cell must not sort a second time
      click('Name');
      await loaded();
      expect(source).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: { key: 'name', direction: 'desc' } }),
        expect.any(AbortSignal),
      );

      fireEvent.click(screen.getByRole('columnheader', { name: 'City' }));
      expect(source).toHaveBeenLastCalledWith(
        expect.objectContaining({ sort: { key: 'name', direction: 'desc' } }),
        expect.any(AbortSignal),
      );
    });

    it('never wraps the header of a column or of a column group', async () => {
      renderNav({
        columns: [
          { header: 'A very long group header that does not fit', columns: [{ key: 'name', header: 'Name' }] },
          { key: 'city', header: 'A very long sortable column header', sortable: true },
          { key: 'id', header: 'A very long plain column header' },
        ],
      });
      await loaded();

      for (const name of [/very long group/, /very long sortable/, /very long plain/]) {
        const header = screen.getByRole('columnheader', { name });

        const truncated = header.querySelector('.groupTitle, .headerText');

        expect(truncated).not.toBeNull();

        const style = getComputedStyle(truncated!);

        expect(style.whiteSpace).toBe('nowrap');
        expect(style.textOverflow).toBe('ellipsis');
        expect(style.overflow).toBe('hidden');
      }
    });

    it('keeps the title and the subtitle close together: one line box each, in tight line heights', async () => {
      renderNav({ title: 'Active customers', subtitle: 'Customers who ordered lately' });

      const title = await screen.findByText('Active customers');
      const subtitle = screen.getByText('Customers who ordered lately');

      // the subtitle directly follows the title: no spacer between them
      expect(title.parentElement).toBe(subtitle.parentElement);
      expect(title.nextElementSibling).toBe(subtitle);
    });

    it('shows title and subtitle', async () => {
      renderNav({ title: 'Users', subtitle: 'All accounts' });

      expect(await screen.findByText('Users')).toBeTruthy();
      expect(screen.getByText('All accounts')).toBeTruthy();
    });

    it('puts all columns into the lower header row when there are groups, with a filler above ungrouped columns', async () => {
      const { container } = renderNav({
        columns: [
          { header: 'Person', columns: [{ key: 'name', header: 'Name' }] },
          { key: 'city', header: 'City' },
        ],
      });
      await loaded();

      const person = screen.getByRole('columnheader', { name: 'Person' });

      expect(screen.getByRole('columnheader', { name: 'City' }).classList.contains('headerSub')).toBe(true);

      expect(container.querySelectorAll('.headerFiller')).toHaveLength(1);

      expect(container.querySelector('.headerFiller')?.getAttribute('role')).toBe('presentation');
      expect(screen.getByRole('columnheader', { name: 'Name' }).classList.contains('headerSub')).toBe(true);
      expect(person.classList.contains('groupHeader')).toBe(true);
      expect(person.style.gridColumn).toBe('1 / span 1');
    });

    it('reserves the space of the vertical scrollbar of the rows area', async () => {
      const { container } = renderNav();
      await loaded();

      expect(container.querySelector('.scroller')).not.toBeNull();
      expect(declarationsOf('.scroller')).toMatch(/overflow-y:\s*auto/);
      expect(declarationsOf('.scroller')).toMatch(/scrollbar-gutter:\s*stable/);
    });

    it('draws the line below a column group on the group cell, spanning all its columns', async () => {
      renderNav({
        columns: [
          { header: 'Group', columns: [{ key: 'name', header: 'Name' }, { key: 'city', header: 'City' }] },
          { key: 'id', header: 'Id' },
        ],
      });
      await loaded();

      const group = screen.getByRole('columnheader', { name: 'Group' });

      expect(group.style.gridColumn).toBe('1 / span 2');
      expect(group.classList.contains('groupHeader')).toBe(true);
      // the line is a pseudo-element inset by the radius, so neighboring lines are 2 × the radius apart
      expect(baseStylesheet).toMatch(
        /\.groupHeader,\s*\.headerFiller \{[^}]*border-bottom: 1px solid transparent;\s*&::after \{[^}]*inset-inline: var\(--datnav-radius\);[^}]*height: 1px;[^}]*background-color: var\(--datnav-color-border\);/,
      );
      expect(declarationsOf('.groupTitle')).not.toMatch(/border/);
    });

    it('draws the line below the upper header row over all data columns, also under the fillers', async () => {
      renderNav({
        columns: [
          { header: 'Group', columns: [{ key: 'name', header: 'Name' }] },
          { key: 'city', header: 'City' },
        ],
      });
      await loaded();

      expect(declarationsOf('.headerFiller')).not.toMatch(/border-bottom:\s*none/);
      // the fillers get the same inset line as the group headers
      expect(baseStylesheet).toMatch(/\.groupHeader,\s*\.headerFiller \{/);
    });

    it('has no vertical line anywhere in the header, with groups or without', async () => {
      const { container } = renderNav({
        selection: 'multi',
        renderDetail: () => <span>detail</span>,
        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
        columns: [
          { key: 'id', header: 'Id', filter: textColumnFilter() },
          { header: 'Group A', columns: [{ key: 'name', header: 'Name' }] },
          { header: 'Group B', columns: [{ key: 'city', header: 'City' }] },
        ],
      });
      await loaded();

      const header = container.querySelector('.headerRow')!;

      // the group header row, the column header row and the filter row are all there ...
      expect(header.querySelectorAll('.groupHeader')).toHaveLength(2);
      expect(header.querySelectorAll('.headerFiller')).toHaveLength(1);
      expect(header.querySelectorAll('.filterCell').length).toBeGreaterThan(0);

      // ... and none of them has a vertical line: not between groups, not above an ungrouped column, and not
      // beside the meta or the action columns
      expect(header.querySelectorAll('[data-separator], [data-divider]')).toHaveLength(0);

      // the dividers of the meta and action columns still run through the data rows below it
      expect(container.querySelectorAll('[role="cell"][data-divider]').length).toBeGreaterThan(0);
    });

    it('draws vertical dividers after the meta columns and before the action column', async () => {
      const { container } = renderNav({
        selection: 'multi',
        renderDetail: () => <span>detail</span>,
        actions: [{ type: 'row', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });

      await loaded();

      // the divider sits on the last meta column (selection, then details): column 2 here
      const endCell = container.querySelector<HTMLElement>('[role="cell"][data-divider="end"]');

      expect(endCell?.closest('[role="columnheader"]')).toBeNull();
      expect(container.querySelectorAll('[data-divider="end"]')).toHaveLength(10);
      expect(container.querySelectorAll('[data-divider="start"]')).toHaveLength(10);
    });

    it('puts the divider after the selection column when there is no details column', async () => {
      const { container } = renderNav({ selection: 'multi' });

      await loaded();

      expect(container.querySelectorAll('[data-divider="end"]')).toHaveLength(10);
      expect(container.querySelectorAll('[data-divider="start"]')).toHaveLength(0);
    });

    it('marks only data rows for the hover highlight, not detail rows', async () => {
      const { container } = renderNav({ renderDetail: () => <span>detail</span> });

      await loaded();
      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);

      // the header row, 10 data rows and the expanded detail row
      expect(container.querySelectorAll('[role="row"]')).toHaveLength(12);
      expect(container.querySelectorAll('.dataRow')).toHaveLength(10);
    });

    it('aligns the header and the cells of a column', async () => {
      renderNav({
        columns: [
          { key: 'name', header: 'Name', align: 'end' },
          { key: 'city', header: 'City', align: 'center' },
          { key: 'id', header: 'Id' },
        ],
      });
      await loaded();

      const alignOf = (element: HTMLElement) => element.getAttribute('data-align');

      expect(alignOf(screen.getByRole('columnheader', { name: 'Name' }))).toBe('end');
      expect(alignOf(cellOf('Person 01'))).toBe('end');
      expect(alignOf(screen.getByRole('columnheader', { name: 'City' }))).toBe('center');
      expect(alignOf(screen.getAllByText('Vienna')[0]!.closest<HTMLElement>('[role="cell"]')!)).toBe('center');
      expect(alignOf(screen.getByRole('columnheader', { name: 'Id' }))).toBeNull();
    });

    it('keeps the toolbar and the footer outside of the scrolling rows area', async () => {
      const { container } = renderNav({ title: 'Users' });
      await loaded();

      const scroller = container.querySelector('.scroller');

      expect(scroller).not.toBeNull();
      expect(scroller?.contains(screen.getByText('Person 01'))).toBe(true);
      expect(scroller?.contains(screen.getByRole('columnheader', { name: 'City' }))).toBe(true);
      expect(scroller?.contains(screen.getByText('Users'))).toBe(false);
      expect(scroller?.contains(screen.getByText('Items 1-10 / 60'))).toBe(false);
    });

    it('puts all header cells, also of column groups, into one sticky header row', async () => {
      renderNav({
        selection: 'multi',
        columns: [
          { header: 'Person', columns: [{ key: 'name', header: 'Name' }] },
          { key: 'city', header: 'City' },
        ],
      });
      await loaded();

      const headers = screen.getAllByRole('columnheader');
      const headerRows = new Set(headers.map((header) => header.closest('.headerRow')));

      expect(headers).toHaveLength(4);
      expect(headerRows.size).toBe(1);
      expect(headerRows.has(null)).toBe(false);
      expect([...headerRows][0]?.getAttribute('role')).toBe('row');
    });

    it('reports the selection appearance, neutral by default', async () => {
      const { container, rerender } = renderNav({ selection: 'multi' });
      await loaded();

      const appearanceOf = () =>
        container.querySelector('[data-selection-appearance]')?.getAttribute('data-selection-appearance');

      expect(appearanceOf()).toBe('neutral');

      rerender(
        <Nav
          source={createSource()}
          rowKey="id"
          columns={columns}
          actions={[selectionActions.multi]}
          selectionAppearance="accent"
        />,
      );
      expect(appearanceOf()).toBe('accent');
    });

    it('frames selected rows with a line on top and at the bottom: gray, or in the selection border color with accent', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      // jsdom does not compute this: read the rules of the stylesheet
      const rules = [...document.styleSheets]
        .flatMap((sheet) => [...sheet.cssRules])
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
      const textOf = (selector: string) =>
        rules.filter((rule) => rule.selectorText === selector).map((rule) => rule.cssText).join(' ');
      const base = textOf('.cell[data-selected]');
      const accent = textOf(':where([data-selection-appearance=\'accent\']) .cell[data-selected]');

      // every selected row: a gray line on top and at the bottom, the top one overlapping the line of the row above
      expect(base).toMatch(/margin-top:\s*-1px/);
      expect(base).toMatch(/border-top:\s*1px solid var\(--datnav-color-border\)/);
      expect(base).toMatch(/border-bottom-color:\s*var\(--datnav-color-border\)/);
      // accent: the same lines in the selection border color, only slightly darker than the background
      expect(accent).toMatch(/border-top-color:\s*var\(--datnav-color-selected-border\)/);
      expect(accent).toMatch(/border-bottom-color:\s*var\(--datnav-color-selected-border\)/);
      expect(accent).not.toMatch(/var\(--datnav-color-primary\)/);
      // the first row has no top line: the line below the header is right above it
      expect(baseStylesheet).toMatch(
        /\.headerRow \+ \.row > \.cell\[data-selected\] \{\s*margin-top: 0;\s*border-top: none;/,
      );
    });

    it('reports the density, normal by default', async () => {
      const { container, rerender } = renderNav();
      await loaded();

      const densityOf = () => container.querySelector('[data-density]')?.getAttribute('data-density');

      expect(densityOf()).toBe('normal');

      rerender(<Nav source={createSource()} rowKey="id" columns={columns} density="compact" />);
      expect(densityOf()).toBe('compact');

      rerender(<Nav source={createSource()} rowKey="id" columns={columns} density="comfortable" />);
      expect(densityOf()).toBe('comfortable');
    });

    it('has no zebra by default, and stripes every other row from the first when striped', async () => {
      const { container, rerender } = renderNav({ renderDetail: (person) => <span>{person.city}</span> });
      await loaded();

      const striped = () => [...container.querySelectorAll('.dataRow')].map((row) => row.hasAttribute('data-stripe'));

      expect(container.querySelector('[data-striped]')).toBeNull();
      expect(striped().some(Boolean)).toBe(false);

      rerender(
        <Nav
          source={createSource()}
          rowKey="id"
          columns={columns}
          renderDetail={(person: Person) => <span>{person.city}</span>}
          striped
        />,
      );
      await loaded();

      expect(container.querySelector('[data-striped]')).not.toBeNull();

      // the first data row is tinted, then every other one
      expect(striped()).toEqual([true, false, true, false, true, false, true, false, true, false]);

      // jsdom does not compute backgrounds: read the rules of the stylesheet
      const rules = [...document.styleSheets]
        .flatMap((sheet) => [...sheet.cssRules])
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
      const selectorsFor = (needle: string) =>
        rules.filter((rule) => rule.selectorText.includes(needle)).map((rule) => rule.selectorText);

      // the detail row of a striped row is tinted with it
      expect(selectorsFor('data-stripe').some((selector) => selector.includes('detailRow'))).toBe(true);
      // the header has no gray band in any mode: it shows the surface color, so striped mode needs no rule for it
      expect(selectorsFor('data-striped').some((selector) => selector.includes('header'))).toBe(false);
      expect(baseStylesheet).toMatch(/\n\.header \{[^}]*background-color: var\(--datnav-color-surface\);/);
      expect(baseStylesheet).not.toMatch(/linear-gradient\(var\(--datnav-color-header\)/);

      // the zebra replaces the lines between the rows, but only on unselected ones, and only the color goes:
      // the 1px stays, so nothing shifts
      const noLine = rules
        .filter((rule) => rule.selectorText.includes('data-striped') && rule.style.borderBottomColor !== '')
        .map((rule) => rule.selectorText + ' => ' + rule.style.borderBottomColor);

      expect(noLine).toHaveLength(1);
      expect(noLine[0]).toContain(':not([data-selected])');
      expect(noLine[0]).toContain('transparent');
      expect(noLine[0]).toContain('detailRow');
      expect(rules.some((rule) => rule.selectorText.includes('data-striped') && rule.style.borderBottom !== ''))
        .toBe(false);
    });

    it('sizes columns by their ratio', async () => {
      const { container } = renderNav({
        columns: [
          { key: 'name', header: 'Name', width: 3 },
          { key: 'city', header: 'City' },
        ],
      });

      await loaded();

      const table = container.querySelector<HTMLElement>('[role="table"]');

      expect(table?.style.gridTemplateColumns).toBe('minmax(0, 3fr) minmax(0, 1fr)');
    });
  });

  describe('loading', () => {
    it('blocks all interaction while loading and shows the spinner only after a delay', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      let resolve: (result: Spec.Result<Person>) => void = () => {};
      const source = () => new Promise<Spec.Result<Person>>((done) => (resolve = done));
      const { container } = renderNav({ source });

      expect(container.querySelector('[inert]')).not.toBeNull();
      expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
      expect(screen.queryByLabelText('Loading')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Some UI libraries show their spinner one timer tick later than the data navigator asks for it.
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByLabelText('Loading')).toBeTruthy();

      await act(async () => resolve({ rows: [], total: 0 }));

      expect(container.querySelector('[inert]')).toBeNull();
      expect(screen.queryByLabelText('Loading')).toBeNull();
    });

    it('places the loading overlay below the header and dims only the rows', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      let resolve: (result: Spec.Result<Person>) => void = () => {};
      const source = () => new Promise<Spec.Result<Person>>((done) => (resolve = done));
      const { container } = renderNav({ source });
      const root = container.querySelector('[aria-busy]')!;

      expect(root.hasAttribute('data-dimmed')).toBe(false);
      expect(container.querySelector('.overlay')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(250);
      });

      const overlay = container.querySelector('.overlay')!;
      const header = container.querySelector('.headerRow')!;

      expect(root.hasAttribute('data-dimmed')).toBe(true);
      expect(overlay).not.toBeNull();
      expect(overlay.parentElement).toBe(container.querySelector('.scrollArea'));
      expect(overlay.contains(header)).toBe(false);
      expect(header.contains(overlay)).toBe(false);

      // the rows are dimmed by the stylesheet: everything inside a row, but never the header row
      expect(declarationsOf('.root[data-dimmed] .row > *')).toMatch(/opacity:\s*0\.3/);
      expect(header.classList.contains('row')).toBe(false);

      await act(async () => resolve({ rows: [], total: 0 }));

      expect(container.querySelector('.overlay')).toBeNull();
      expect(root.hasAttribute('data-dimmed')).toBe(false);
    });

    it('gives the rows area and the overlay a minimum height, so the spinner always fits below the header', async () => {
      const { container } = renderNav({ source: () => new Promise<Spec.Result<Person>>(() => {}) });

      // no rows yet (first load): the table must not collapse to the header alone ...
      expect(container.querySelectorAll('[role="row"]')).toHaveLength(1);
      expect(declarationsOf('.scrollArea')).toMatch(/min-height:\s*calc\(6\s*\*/);
      // ... and the overlay keeps its own room, whatever the header costs (it is out of flow, so it adds no height)
      expect(declarationsOf('.overlay')).toMatch(/min-height:\s*calc\(6\s*\*/);
    });

    it('starts the overlay below the measured height of the header', async () => {
      const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!;

      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => 48 });

      try {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

        const { container } = renderNav({ source: () => new Promise<Spec.Result<Person>>(() => {}) });

        act(() => {
          vi.advanceTimersByTime(250);
        });

        expect(container.querySelector<HTMLElement>('.overlay')?.style.top).toBe('48px');
      } finally {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original);
      }
    });

    it('aborts the running load when a newer one starts', async () => {
      const signals: AbortSignal[] = [];
      const source = (_query: Spec.Query, signal: AbortSignal) => {
        signals.push(signal);

        return new Promise<Spec.Result<Person>>(() => {});
      };

      renderNav({ source });

      expect(signals).toHaveLength(1);
      expect(signals[0]!.aborted).toBe(false);

      fireEvent.click(screen.getByRole('button', { name: 'Name' }));

      expect(signals).toHaveLength(2);
      expect(signals[0]!.aborted).toBe(true);
      expect(signals[1]!.aborted).toBe(false);
    });

    it('aborts the running load on unmount', () => {
      const signals: AbortSignal[] = [];
      const source = (_query: Spec.Query, signal: AbortSignal) => {
        signals.push(signal);

        return new Promise<Spec.Result<Person>>(() => {});
      };

      const { unmount } = renderNav({ source });

      expect(signals[0]!.aborted).toBe(false);

      unmount();

      expect(signals[0]!.aborted).toBe(true);
    });

    it('does not log the rejection caused by an abort, but logs another one', async () => {
      const error = vi.spyOn(console, 'error').mockImplementation(() => {});

      try {
        const source = (_query: Spec.Query, signal: AbortSignal) =>
          new Promise<Spec.Result<Person>>((_resolve, reject) => {
            signal.addEventListener('abort', () => reject(signal.reason), { once: true });
          });

        renderNav({ source });
        fireEvent.click(screen.getByRole('button', { name: 'Name' }));
        await act(async () => {});

        expect(error).not.toHaveBeenCalled();

        const failing = () => Promise.reject(new Error('boom'));

        renderNav({ source: failing });
        await act(async () => {});

        expect(error).toHaveBeenCalledTimes(1);
      } finally {
        error.mockRestore();
      }
    });

    it('ignores the response of an outdated request', async () => {
      const resolvers: ((result: Spec.Result<Person>) => void)[] = [];
      const source = () => new Promise<Spec.Result<Person>>((done) => resolvers.push(done));
      const rowOf = (name: string): Spec.Result<Person> => ({ rows: [{ id: 1, name, city: '-' }], total: 1 });

      renderNav({ source });
      fireEvent.click(screen.getByRole('button', { name: 'Name' }));

      expect(resolvers).toHaveLength(2);

      await act(async () => resolvers[1]?.(rowOf('newer')));
      await act(async () => resolvers[0]?.(rowOf('outdated')));

      expect(screen.getByText('newer')).toBeTruthy();
      expect(screen.queryByText('outdated')).toBeNull();
    });
  });

  describe('texts', () => {
    // A small adapter: German texts with `{name}` placeholders, English (the default value) for the rest.
    const adapterOf = (texts: Readonly<Record<string, string>>, locale = 'de-DE'): Spec.I18nAdapter => ({
      currentLocale: () => locale,
      resolveText: (_, key, params, defaultValue) =>
        texts[key]?.replace(/\{(\w+)\}/g, (__, name: string) => String(params?.[name])) ?? defaultValue,
    });

    it('uses the translations of the adapter and falls back to English for missing ones', async () => {
      const German = createDataNavigator({ i18n: adapterOf({ pageSize: 'Seitengröße', pageOf: 'von {pages}' }) });

      render(<German source={createSource()} rowKey="id" columns={columns} pageSize={10} />);

      expect(await screen.findByText('Seitengröße')).toBeTruthy();
      expect(screen.getByText('von 6')).toBeTruthy();
      expect(screen.getByText('Items 1-10 / 60')).toBeTruthy();
    });

    it('asks the adapter with the namespace, the key, the raw params and the English text filled in', async () => {
      const resolveText = vi.fn((_: string, __: string, ___: unknown, defaultValue: string) => defaultValue);
      const Tracked = createDataNavigator({ i18n: { currentLocale: () => 'en-US', resolveText } });

      render(<Tracked source={createSource()} rowKey="id" columns={columns} pageSize={10} />);
      await loaded();

      expect(resolveText).toHaveBeenCalledWith('datanav', 'pageSize', null, 'Page Size');
      expect(resolveText).toHaveBeenCalledWith(
        'datanav',
        'itemRange',
        { from: 1, to: 10, total: 60 },
        'Items 1-10 / 60',
      );
    });

    it('translates the default placeholder of a text filter', async () => {
      const German = createDataNavigator({ i18n: adapterOf({ filterPlaceholder: 'Filtern' }) });
      const filtered: readonly Spec.Column<Person>[] = [
        { key: 'name', header: 'Name', filter: textColumnFilter() },
      ];

      render(<German source={createSource()} rowKey="id" columns={filtered} pageSize={10} />);

      expect((await screen.findByRole('textbox', { name: 'Name' })).getAttribute('placeholder')).toBe('Filtern');
    });

    it('formats numbers in the locale of the adapter', async () => {
      const German = createDataNavigator({ i18n: adapterOf({}, 'de-DE') });
      const many = async (query: Spec.Query) => ({ ...(await createSource()(query)), total: 12345 });

      render(<German source={many} rowKey="id" columns={columns} pageSize={10} />);

      expect(await screen.findByText('Items 1-10 / 12.345')).toBeTruthy();
    });

    it('refreshes its texts when the adapter reports a change of the language', async () => {
      let language = 'en';
      let notify = () => {};
      const Switching = createDataNavigator({
        i18n: {
          currentLocale: () => language,
          resolveText: (_, key, __, defaultValue) =>
            language === 'de' && key === 'pageSize' ? 'Seitengröße' : defaultValue,
          onChange: (listener) => {
            notify = listener;

            return () => {};
          },
        },
      });

      render(<Switching source={createSource()} rowKey="id" columns={columns} pageSize={10} />);

      expect(await screen.findByText('Page Size')).toBeTruthy();

      language = 'de';
      act(() => notify());

      expect(await screen.findByText('Seitengröße')).toBeTruthy();
    });
  });
});

describe('theming', () => {
  const keys = [
    'colorText',
    'colorTextDimmed',
    'colorSurface',
    'colorBorder',
    'colorHeader',
    'colorHeaderHover',
    'colorHover',
    'colorHoverBorder',
    'colorHoverAccent',
    'colorStripe',
    'colorStripeHover',
    'colorSelected',
    'colorSelectedBorder',
    'colorSelectedNeutral',
    'colorPrimary',
    'colorPrimaryHover',
    'colorOnPrimary',
    'colorDanger',
    'colorFocus',
    'radius',
    'shadow',
    'fontFamily',
    'fontSize',
    'fontSizeSm',
    'fontWeightBold',
    'spacingXs',
    'spacingSm',
    'spacingMd',
    'controlHeight',
  ];

  // `colorTextDimmed` → `--datnav-color-text-dimmed`
  const propertyOf = (key: string) => `--datnav-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

  const rootOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;

  it.each([['default', defaultTheme], ['Mantine', mantineTheme], ['Ant Design', antdTheme]] as const)(
    'has a value for every design value in the %s theme',
    (_, theme) => {
      expect(Object.keys(theme)).toEqual(keys);
    },
  );

  it('sets the default theme on its root as custom properties, a light and a dark color with light-dark()', async () => {
    const { container } = render(<Nav source={createSource()} rowKey="id" columns={columns} />);

    await loaded();

    const style = rootOf(container).style;

    expect(style.getPropertyValue('--datnav-color-text')).toBe('light-dark(#111, #f5f5f5)');
    expect(style.getPropertyValue('--datnav-radius')).toBe('5px');
    expect(keys.every((key) => style.getPropertyValue(propertyOf(key)) !== '')).toBe(true);
  });

  it('takes the values of its theme, and the default theme for the missing ones', async () => {
    const Themed = createDataNavigator({ theme: { colorText: 'rebeccapurple', radius: '2px' } });
    const { container } = render(<Themed source={createSource()} rowKey="id" columns={columns} />);

    await loaded();

    const style = rootOf(container).style;

    expect(style.getPropertyValue('--datnav-color-text')).toBe('rebeccapurple');
    expect(style.getPropertyValue('--datnav-radius')).toBe('2px');
    expect(style.getPropertyValue('--datnav-color-border')).toBe('light-dark(#a8a8a8, #5c5c5c)');
  });

  it('only reads its custom properties in the stylesheet: it sets none, has no hard-coded color, and mixes colors only when pressed', () => {
    const used = new Set([...baseStylesheet.matchAll(/var\((--datnav-[a-z-]+)\)/g)].map((match) => match[1]));
    const known = keys.map(propertyOf);

    expect([...used].filter((property) => !known.includes(property!))).toEqual([]);
    expect(baseStylesheet).not.toMatch(/--datnav-[a-z-]+\s*:/);
    expect(baseStylesheet).not.toMatch(/--dn-/);
    // (comments may mention these, the rules may not)
    expect(baseStylesheet.replace(/\/\*[\s\S]*?\*\//g, '')).not.toMatch(
      /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|light-dark\(/i,
    );

    // color-mix() only for pressed states: every use sits in a rule for :active
    const mixes = [...baseStylesheet.matchAll(/color-mix\(/g)].map((match) => match.index);

    expect(mixes.length).toBeGreaterThan(0);

    for (const index of mixes) {
      const opening = baseStylesheet.lastIndexOf('{', index);
      const selector = baseStylesheet.slice(baseStylesheet.lastIndexOf('\n', opening) + 1, opening);

      expect(selector).toMatch(/:active/);
    }
  });

  it.each([['Mantine', mantineTheme, '--mantine-'], ['Ant Design', antdTheme, '--ant-']] as const)(
    'maps the design values onto the variables of %s',
    (_, theme, prefix) => {
      const values = Object.values(theme).map(String);

      // colors come from the library: no hard-coded color at all
      expect(values.join(' ')).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|color-mix\(/i);
      expect(values.filter((value) => value.includes(prefix)).length).toBeGreaterThan(20);
    },
  );
});

describe('native widgets', () => {
  const archive = { type: 'general', key: 'archive', label: 'Archive', onClick: vi.fn() } as const;
  const print = { type: 'general', key: 'print', label: 'Print', onClick: vi.fn() } as const;
  const menu = { type: 'menu', key: 'more', label: 'More', actions: [archive, print] } as const;

  it('opens a menu from the keyboard on its first item, moves with the arrow keys and closes with Escape', async () => {
    render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[menu]} />);
    await loaded();

    const button = screen.getByRole('button', { name: 'More' });

    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');

    // opened from the keyboard, the first item has the focus (opened with the mouse, none has it yet)
    act(() => button.focus());
    fireEvent.keyDown(button, { key: 'ArrowDown' });

    const items = await screen.findAllByRole('menuitem');

    expect(button.getAttribute('aria-expanded')).toBe('true');
    await waitFor(() => expect(document.activeElement).toBe(items[0]));

    fireEvent.keyDown(items[0]!, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(items[1]));

    // the focus wraps around at the end
    fireEvent.keyDown(items[1]!, { key: 'ArrowDown' });
    await waitFor(() => expect(document.activeElement).toBe(items[0]));

    fireEvent.keyDown(items[0]!, { key: 'End' });
    await waitFor(() => expect(document.activeElement).toBe(items[1]));

    fireEvent.keyDown(items[1]!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(button));
  });

  it('gives the tip to assistive technology as a description where it is not the name already', async () => {
    const labeled = { type: 'general', key: 'add', label: 'Add', tip: 'Add a person', onClick: vi.fn() } as const;
    const iconOnly = { type: 'general', key: 'edit', icon: <span />, tip: 'Edit', onClick: vi.fn() } as const;

    render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[labeled, iconOnly]} />);
    await loaded();

    // a labeled button is described by its tip, an icon-only button is named by it (no description)
    expect(screen.getByRole('button', { name: 'Add' }).getAttribute('aria-description')).toBe('Add a person');
    expect(screen.getByRole('button', { name: 'Edit' }).getAttribute('aria-description')).toBeNull();
    // the sort hint of a sortable header
    expect(screen.getByRole('button', { name: 'Name' }).getAttribute('aria-description')).toBe('Sort ascending');
  });

  it('closes a menu when an item is chosen, and runs its action once', async () => {
    render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[menu]} />);
    await loaded();

    click('More');
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Print' }));

    expect(print.onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('closes a menu with a second click on its button', async () => {
    render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[menu]} />);
    await loaded();

    click('More');
    expect(await screen.findByRole('menu')).toBeTruthy();

    click('More');
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('opens the list of a select inside the root, so it gets the tokens of the theme', async () => {
    render(<Nav source={createSource()} rowKey="id" columns={columns} pageSizeOptions={[10, 25]} />);
    await loaded();

    fireEvent.click(screen.getByRole('combobox', { name: 'Page Size' }));

    const list = await screen.findByRole('listbox');

    // inside the root, which carries the theme as its custom properties
    expect(list.closest('.root')?.getAttribute('style')).toMatch(/--datnav-color-surface/);
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['10', '25']);
  });

  it('gives a single select filter "All" as its first option, which removes the filter', async () => {
    const source = createSource();
    const filtered = () => source.mock.lastCall?.[0].filters;

    render(
      <Nav
        source={source}
        rowKey="id"
        columns={[{ key: 'city', header: 'City', filter: selectColumnFilter({ options: ['Vienna', 'Berlin'] }) }]}
      />,
    );
    await loaded();

    expect(shownIn('City')).toBe('All');

    await chooseFilterOption('City', 'Berlin');
    await waitFor(() => expect(filtered()).toEqual({ city: 'Berlin' }));
    expect(screen.queryAllByRole('option').map((option) => option.textContent)).toEqual([]);

    fireEvent.click(filterField('City'));
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual([
      'All',
      'Vienna',
      'Berlin',
    ]);
    // the checkmark sits in front of the chosen option, and its room is kept on every option
    const marks = screen.getAllByRole('option').map((option) => option.firstElementChild);

    expect(marks.every((mark) => mark?.classList.contains('selectCheck'))).toBe(true);
    expect(marks.map((mark) => mark?.querySelector('svg') !== null)).toEqual([false, false, true]);

    await chooseFilterOption('City', 'All');
    await waitFor(() => expect(filtered()).toEqual({}));
    expect(shownIn('City')).toBe('All');
  });

  it('keeps a multiple select filter open while options are chosen, and shows the chosen ones', async () => {
    const source = createSource();
    const filtered = () => source.mock.lastCall?.[0].filters;

    render(
      <Nav
        source={source}
        rowKey="id"
        columns={[
          {
            key: 'city',
            header: 'City',
            filter: selectColumnFilter({ options: ['Vienna', 'Berlin'], multiple: true }),
          },
        ]}
      />,
    );
    await loaded();

    await chooseFilterOption('City', 'Vienna');
    await chooseFilterOption('City', 'Berlin');
    await waitFor(() => expect(filtered()).toEqual({ city: ['Vienna', 'Berlin'] }));

    // no "All" option in a multiple select, and the list is still open
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Vienna', 'Berlin']);
    // every option shows a checkbox in front, only as a picture of its state
    const boxes = screen.getAllByRole('option').map((option) => option.firstElementChild);

    expect(boxes.every((box) => box instanceof HTMLInputElement && box.type === 'checkbox')).toBe(true);
    expect(boxes.map((box) => (box as HTMLInputElement).checked)).toEqual([true, true]);
    expect(boxes.every((box) => box?.getAttribute('aria-hidden') === 'true' && box.getAttribute('tabindex') === '-1'))
      .toBe(true);
    expect(shownIn('City')).toBe('Vienna, Berlin');
  });
});

describe('toolbar', () => {
  const add = { type: 'general', key: 'add', label: 'Add', onClick: vi.fn() } as const;
  const remove = { type: 'rows', key: 'remove', label: 'Remove', onClick: vi.fn() } as const;

  // The rules of the stylesheet for a class, as written in the source (nested rules included).
  const rulesOf = (name: string) => {
    const from = baseStylesheet.indexOf(`\n.${name} {`);
    const to = baseStylesheet.indexOf('\n}\n', from);

    return from < 0 ? '' : baseStylesheet.slice(from, to);
  };

  it('shows the title and the subtitle above the bar', async () => {
    const { container } = render(
      <Nav
        source={createSource()}
        rowKey="id"
        columns={columns}
        title="Users"
        subtitle="All of them"
        searchable
        actions={[add]}
      />,
    );
    await loaded();

    const heading = container.querySelector('.toolbarHeading')!;
    const bar = container.querySelector('.toolbarBar')!;

    expect(heading.textContent).toBe('UsersAll of them');
    expect(heading.nextElementSibling).toBe(bar);
    expect(bar.contains(screen.getByRole('button', { name: 'Add' }))).toBe(true);
  });

  it('puts the actions on the left and the search box on the right, with the free space between them', async () => {
    const { container } = render(
      <Nav source={createSource()} rowKey="id" columns={columns} searchable actions={[add]} />,
    );
    await loaded();

    const parts = [...container.querySelector('.toolbarBar')!.children];

    expect(parts.map((part) => part.className)).toEqual(['toolbarActions', 'toolbarSpacer', 'searchField']);
    expect(rulesOf('toolbarSpacer')).toMatch(/flex: 1 1 auto/);
    expect(rulesOf('searchField')).toMatch(/width: 16rem/);
  });

  it('renders no heading without title and subtitle, and no bar without actions and search box', async () => {
    const { container } = render(<Nav source={createSource()} rowKey="id" columns={columns} title="Users" />);
    await loaded();

    expect(container.querySelector('.toolbarHeading')).not.toBeNull();
    expect(container.querySelector('.toolbarBar')).toBeNull();

    cleanup();

    const searchOnly = render(<Nav source={createSource()} rowKey="id" columns={columns} searchable />);
    await loaded();

    expect(searchOnly.container.querySelector('.toolbarHeading')).toBeNull();
    expect(searchOnly.container.querySelector('.toolbarBar')).not.toBeNull();
  });

  it('adds the actions for a selection at the end of the buttons, so the others do not move', async () => {
    render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[add, remove]} />);
    await loaded();

    const buttons = () =>
      [...document.querySelector('.toolbarActions')!.querySelectorAll('button')].map((button) => button.textContent);

    expect(buttons()).toEqual(['Add']);

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

    expect(buttons()).toEqual(['Add', 'Remove']);
  });

  it('fills primary and danger buttons in the toolbar, and keeps the buttons in the rows link-like', () => {
    const button = rulesOf('button');

    expect(button).toMatch(/&\[data-variant='primary'\] \{[^}]*background-color: var\(--datnav-color-primary\)/);
    expect(button).toMatch(
      /&\[data-variant='danger'\] \{[^}]*background-color: var\(--datnav-color-danger\);[^}]*color: var\(--datnav-color-on-primary\)/,
    );
    expect(button).toMatch(/&\[data-placement='row'\] \{[^}]*background-color: transparent/);
  });
});

describe('selection controls', () => {
  it('draws checkboxes and radios itself: a checked one shows its border and tick in the check color, no fill', () => {
    const check = baseStylesheet.slice(baseStylesheet.indexOf('\n.check {'));

    expect(check).toMatch(/^[^}]*appearance: none;/);
    // the box keeps the surface color when checked: only the border and the tick take the check color
    expect(check).toMatch(/&:checked,\s*&:indeterminate \{\s*border-color: currentColor;\s*\}/);
    expect(check).toMatch(/&::before \{[^}]*background-color: currentColor;[^}]*mask:/);
    expect(check).not.toMatch(/&:checked \{[^}]*background-color/);
  });

  it('makes the selection checkboxes and radios gray with the neutral appearance, and only those', () => {
    expect(baseStylesheet).toMatch(
      /:where\(\[data-selection-appearance='neutral'\]\) :is\(\.dataRow > \.cell > \.check, \.headerTall > \.check\) \{\s*color: var\(--datnav-color-text-dimmed\);/,
    );
    expect(baseStylesheet).toMatch(/\n\.check \{[^}]*color: var\(--datnav-color-primary\);/);
  });
});

describe('cell text', () => {
  it('hyphenates long words and breaks a word only when it does not fit on a line at all', () => {
    const cell = baseStylesheet.slice(baseStylesheet.indexOf('\n.cell {'));

    expect(cell).toMatch(/^[^}]*hyphens: auto;/);
    expect(cell).toMatch(/^[^}]*overflow-wrap: break-word;/);
    expect(baseStylesheet).not.toMatch(/overflow-wrap: anywhere/);
  });

  it('keeps plain text on one line with an ellipsis, and wraps it in columns with wrap', async () => {
    render(
      <Nav
        source={createSource()}
        rowKey="id"
        columns={[{ key: 'name', header: 'Name' }, { key: 'city', header: 'City', wrap: true }]}
      />,
    );
    await loaded();

    const name = screen.getByText('Person 01');
    const city = screen.getAllByText('Vienna')[0]!;

    // plain text gets a span of its own, which the stylesheet cuts off with an ellipsis
    expect(name.classList.contains('cellText')).toBe(true);
    expect(name.parentElement?.hasAttribute('data-wrap')).toBe(false);
    expect(city.parentElement?.hasAttribute('data-wrap')).toBe(true);

    const text = baseStylesheet.slice(baseStylesheet.indexOf('\n.cellText {'));

    expect(text).toMatch(/^[^}]*overflow: hidden;[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/);
    expect(text).toMatch(
      /:where\(\.cell\[data-wrap\], \.detailCell\) > & \{\s*overflow: visible;\s*white-space: normal;/,
    );
  });

  it('leaves custom content alone', async () => {
    render(
      <Nav
        source={createSource()}
        rowKey="id"
        columns={[{ key: 'name', header: 'Name', render: (person) => <b>{person.name}</b> }]}
      />,
    );
    await loaded();

    expect(screen.getByText('Person 01').tagName).toBe('B');
    expect(screen.getByText('Person 01').classList.contains('cellText')).toBe(false);
  });
});

describe('accent hover', () => {
  it('tints hovered rows with the accent hover color in accent mode, after the gray hovers', () => {
    const hover = baseStylesheet.slice(baseStylesheet.lastIndexOf('@media (hover: hover)'));
    const accent = hover.indexOf('[data-selection-appearance=\'accent\']) .dataRow:hover > .cell');

    expect(accent).toBeGreaterThan(hover.indexOf('var(--datnav-color-stripe-hover)'));
    expect(hover.slice(accent)).toMatch(/^[^}]*background-color: var\(--datnav-color-hover-accent\);/);
  });
});

describe('text selection', () => {
  it('lets no text be selected in the toolbar, the header and the footer, except in text inputs', () => {
    expect(baseStylesheet).toMatch(
      /\.toolbar,\s*\.headerRow,\s*\.footer \{\s*user-select: none;\s*& :is\(input, textarea\) \{\s*user-select: text;/,
    );
    // the rows stay selectable
    expect(baseStylesheet).not.toMatch(/\.(row|dataRow|cell) \{[^}]*user-select: none/);
  });
});

describe('vertical dividers', () => {
  it('hides the dividers of selected and hovered rows, by color only', () => {
    expect(baseStylesheet).toMatch(
      /\.cell\[data-selected\]\[data-divider='end'\] \{\s*border-right-color: transparent;/,
    );
    expect(baseStylesheet).toMatch(
      /\.cell\[data-selected\]\[data-divider='start'\] \{\s*border-left-color: transparent;/,
    );

    const hover = baseStylesheet.slice(baseStylesheet.lastIndexOf('@media (hover: hover)'));

    expect(hover).toMatch(
      /\.detailRow:hover > \.cell\[data-divider='end'\],[^{]*\{\s*border-right-color: transparent;/,
    );
    expect(hover).toMatch(
      /\.detailRow:hover > \.cell\[data-divider='start'\],[^{]*\{\s*border-left-color: transparent;/,
    );
  });
});

describe('sortable header hover', () => {
  it('draws a rounded shape inside the cell on hover, behind the text', () => {
    const header = baseStylesheet.slice(baseStylesheet.indexOf('\n.header {'));

    expect(header).toMatch(/&::before \{[^}]*inset: 3px;[^}]*z-index: -1;[^}]*border-radius: var\(--datnav-radius\);/);
    expect(header).toMatch(
      /&\[data-sortable\]:hover::before \{\s*background-color: var\(--datnav-color-header-hover\);/,
    );
  });
});

describe('row hover', () => {
  it('draws a line on top and at the bottom of a hovered row, without moving it, and none on top of the first', () => {
    const hover = baseStylesheet.slice(baseStylesheet.lastIndexOf('@media (hover: hover)'));

    expect(hover).toMatch(
      /\.dataRow:hover > \.cell:not\(\[data-selected\]\),\s*\.dataRow:has\(\+ \.detailRow:hover\) > \.cell:not\(\[data-selected\]\) \{\s*margin-top: -1px;\s*border-top: 1px solid var\(--datnav-color-hover-border\);/,
    );
    expect(hover).toMatch(
      /\.detailRow:hover > \.cell:not\(\[data-selected\]\) \{\s*border-bottom-color: var\(--datnav-color-hover-border\);/,
    );
    expect(hover).toMatch(
      /\.headerRow \+ \.dataRow:hover > \.cell:not\(\[data-selected\]\),[^{]*\{\s*margin-top: 0;\s*border-top: none;/,
    );
  });
});

describe('controller', () => {
  // A table with a controller, and buttons outside of it that use the controller, like an app would.
  function Controlled(props: { source: Spec.Source<Person> }): ReactElement {
    const nav = useDataNavigatorController<Person>();
    const selected = useDataNavigatorSelection(nav);

    return (
      <>
        <Nav
          controller={nav}
          source={props.source}
          rowKey="id"
          columns={columns}
          pageSize={10}
          actions={[{ type: 'rows', key: 'remove', label: 'Remove', onClick: () => {} }]}
        />
        <button type="button" onClick={() => nav.reload()}>Reload from outside</button>
        <button type="button" onClick={() => nav.clearRowSelection()}>Clear from outside</button>
        <output>{selected.map((person) => person.name).join(', ')}</output>
      </>
    );
  }

  it('reloads the current page with the same query, and clears the selection', async () => {
    const source = createSource();

    render(<Controlled source={source} />);
    await loaded();
    click('Name');
    await loaded();
    click('Next page');
    await loaded();
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

    const query = source.mock.lastCall?.[0];
    const calls = source.mock.calls.length;

    click('Reload from outside');
    await loaded();

    expect(source.mock.calls.length).toBe(calls + 1);
    expect(source.mock.lastCall?.[0]).toEqual(query);
    expect(screen.queryByText('1 selected')).toBeNull();
  });

  it('goes to the last page that still exists when a reload returns fewer rows', async () => {
    let total = 60;
    const source = vi.fn(async (query: Spec.Query): Promise<Spec.Result<Person>> => ({
      rows: people.slice((query.page - 1) * query.pageSize, Math.min(query.page * query.pageSize, total)),
      total,
    }));

    render(<Controlled source={source} />);
    await loaded();
    click('Last page');
    await loaded();

    total = 25;
    click('Reload from outside');

    await waitFor(() => expect(source.mock.lastCall?.[0].page).toBe(3));
    await loaded();

    expect(screen.getByText('Items 21-25 / 25')).toBeTruthy();
  });

  it('clears the selection from outside, and reports the selected rows as they change', async () => {
    render(<Controlled source={createSource()} />);
    await loaded();

    const output = () => document.querySelector('output')?.textContent;

    expect(output()).toBe('');

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

    expect(output()).toBe('Person 01, Person 02');

    click('Clear from outside');

    expect(output()).toBe('');
    expect(screen.queryByText('2 selected')).toBeNull();
  });
});
