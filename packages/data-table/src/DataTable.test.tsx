import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createContext, useContext } from 'react';
import type { ReactElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDataTableController, useDataTableSelection } from './core/controllerHooks';
import { dateColumnEditor, selectColumnEditor, textColumnEditor } from './core/view/ColumnEditors';
import {
  autocompleteColumnFilter,
  booleanColumnFilter,
  dateRangeColumnFilter,
  numberRangeColumnFilter,
  selectColumnFilter,
  textColumnFilter,
} from './core/view/ColumnFilters';
import baseStylesheet from './core/view/DataTable.css?raw';
import type { DataTableComponent as Spec } from './react/api';
import { createDataTableComponent } from './react/createDataTableComponent';
import { antdTheme } from './themes/antd';
import { defaultTheme } from './themes/default';
import { mantineTheme } from './themes/mantine';
import { softTheme } from './themes/soft';

// The component under test: created without a configuration (English texts, the default theme).
const Nav = createDataTableComponent();

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
      .filter((person) => {
        // A text filter is `{ text, match }`.
        if (typeof nameFilter !== 'object' || nameFilter === null || Array.isArray(nameFilter)) {
          return true;
        }

        const { text: needle, match } = nameFilter as { text?: unknown; match?: unknown };
        const name = person.name.toLowerCase();

        if (typeof needle !== 'string') {
          return true;
        }

        return match === 'startsWith'
          ? name.startsWith(needle.toLowerCase())
          : match === 'endsWith'
          ? name.endsWith(needle.toLowerCase())
          : name.includes(needle.toLowerCase());
      })
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

// The rules of the stylesheet as written: with its `var(--param-…)` (the document has the stylesheet of a theme, with
// the theme's values, scoped to its tables; see core/stylesheet.ts).
let sourceSheet: CSSStyleSheet | undefined;

function sourceRules(): CSSRule[] {
  if (sourceSheet === undefined) {
    sourceSheet = new CSSStyleSheet();
    sourceSheet.replaceSync(baseStylesheet);
  }

  return [...sourceSheet.cssRules];
}

// The declarations of the stylesheet rules for a selector. jsdom cannot compute every property (for example a border
// shorthand with var(), or scrollbar-gutter), so such rules are checked in the stylesheet itself.
function declarationsOf(selector: string): string {
  return sourceRules()
    .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule && rule.selectorText === selector)
    .map((rule) => rule.cssText)
    .join(' ');
}

// The selection mode follows from the actions (there is no selection prop). Tests that need a mode ask for it with the
// test-only option `selection`, and get an action that needs exactly that mode.
const selectionActions = {
  multi: { type: 'multiRow', key: 'test-selection-multi', label: 'Rows action', onClick: () => {} },
  single: { type: 'singleRow', key: 'test-selection-single', label: 'Row action', show: 'toolbar', onClick: () => {} },
} as const satisfies Record<'multi' | 'single', Spec.Action<Person>>;

type NavProps = Partial<Spec.Props<Person>> & { selection?: keyof typeof selectionActions };

// The selectors of all style rules inside a media query with the given condition.
function selectorsInMedia(condition: RegExp): string[] {
  return sourceRules()
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

// The two buttons of the selection bar that clear the selection, both named "Clear selection": the pill on the left,
// the "deselect" button on the right.
function clearSelectionWith(button: 'pill' | 'close'): void {
  const [pill, close] = screen.getAllByRole('button', { name: 'Clear selection' });

  fireEvent.click((button === 'pill' ? pill : close)!);
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

// The page size button of the footer ("10 per page").
function pageSizeButton(): HTMLElement | null {
  return screen.queryByRole('button', { name: / per page$/ });
}

// Chooses a page size in the footer: its menu, then the size.
async function choosePageSize(size: number): Promise<void> {
  fireEvent.click(pageSizeButton()!);
  fireEvent.click(await screen.findByRole('menuitemradio', { name: String(size) }));
}

// Opens the filter view (in place of the rows) with the filter button of the toolbar.
async function openFilters(): Promise<HTMLElement> {
  // A view closed before rolls up first (with the lists it left open: jsdom has no outside press that closes them).
  await waitFor(() => expect(document.querySelector('[data-closing]')).toBeNull());
  fireEvent.click(screen.getByRole('button', { name: 'Filters' }));

  return screen.findByRole('region', { name: 'Filters' });
}

// The field of the filter of the column with this header, in the filter view (an open list is labelled by the
// header too).
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

// jsdom has no layout: the widths of the column headers by their text (0 for anything else), for what measures them.
function mockHeaderWidths(widths: Record<string, number>) {
  const original = HTMLElement.prototype.getBoundingClientRect;

  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function(this: HTMLElement) {
    const text = this.getAttribute('role') === 'columnheader' ? this.textContent ?? '' : '';

    return { ...original.call(this), width: widths[text.trim()] ?? 0 } as DOMRect;
  });
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

describe('DataTable', () => {
  it('shows the rows, the item range and the page count', async () => {
    renderNav();

    expect(await screen.findByText('Person 01')).toBeTruthy();
    expect(screen.getByText('1-10 of 60')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Page 6' })).toBeTruthy();
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

    const pager = ['Previous page', 'Next page'];

    for (const name of pager) {
      expect(screen.getByRole('button', { name }).classList.contains('data-table__pager-button')).toBe(true);
    }

    // on the first page, previous is disabled
    expect((screen.getByRole('button', { name: 'Previous page' }) as HTMLButtonElement).disabled).toBe(true);

    // jsdom does not compute this: read the rule of the stylesheet
    const rules = sourceRules()
      .filter((rule): rule is CSSStyleRule =>
        rule instanceof CSSStyleRule && rule.selectorText.includes('data-table__pager-button')
      )
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
    expect(screen.getByText('11-20 of 60')).toBeTruthy();

    click('Page 6');
    await loaded();

    expect(screen.getByText('51-60 of 60')).toBeTruthy();

    click('Page 1');
    await loaded();

    expect(screen.getByText('1-10 of 60')).toBeTruthy();
  });

  it('shows the page numbers, the current one marked, and "1 of 6" for a narrow footer', async () => {
    renderNav();
    await loaded();

    // six pages: all of them, no gap
    for (let page = 1; page <= 6; page++) {
      expect(screen.getByRole('button', { name: `Page ${page}` }).classList.contains('data-table__page-button')).toBe(
        true,
      );
    }

    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBeNull();
    expect(screen.getByText('1 of 6').classList.contains('data-table__pager-compact')).toBe(true);

    click('Page 3');
    await loaded();

    expect(screen.getByRole('button', { name: 'Page 3' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByText('3 of 6')).toBeTruthy();
  });

  it('shows the page size as a ghost button "10 per page", with a menu like the other menus', async () => {
    renderNav({ pageSizeOptions: [10, 25] });
    await loaded();

    const trigger = screen.getByRole('button', { name: '10 per page' });

    expect(trigger.getAttribute('data-placement')).toBe('tool');

    fireEvent.click(trigger);

    // the menu is named by its button, its group of sizes "Page Size"
    const menu = await screen.findByRole('menu', { name: '10 per page' });
    const [ten, twentyFive] = within(within(menu).getByRole('group', { name: 'Page Size' })).getAllByRole(
      'menuitemradio',
    );

    expect(menu.getAttribute('aria-orientation')).not.toBe('horizontal');
    expect(ten!.getAttribute('aria-checked')).toBe('true');
    expect(twentyFive!.getAttribute('aria-checked')).toBe('false');
    expect(ten!.classList.contains('data-table__menu-item')).toBe(true);

    fireEvent.click(twentyFive!);
    await loaded();

    expect(screen.getByRole('button', { name: / per page$/ }).textContent).toBe('25 per page');
  });

  it('leaves pages out with gaps when there are more than seven', async () => {
    const { container } = renderNav({ source: async () => ({ rows: people.slice(0, 10), total: 270 }) });

    await loaded();

    // 27 pages: 1 2 3 4 5 … 27
    const slots = [...container.querySelectorAll('.data-table__pager-numbers > *')].map((slot) => slot.textContent);

    expect(slots).toEqual(['1', '2', '3', '4', '5', '…', '27']);
    expect(container.querySelector('.data-table__pager-gap')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('keeps its width while paging: every slot as wide as the largest page number needs', async () => {
    // 270 pages: three digits
    const { container } = renderNav({ source: async () => ({ rows: people.slice(0, 10), total: 2700 }) });

    await loaded();

    const slots = [...container.querySelectorAll<HTMLElement>('.data-table__pager-numbers > *')];
    const gap = container.querySelector<HTMLElement>('.data-table__pager-gap')!;

    // with the values of the default theme: a control 32px high, the smallest spacing 8px
    expect(slots.map((slot) => slot.style.minWidth || slot.style.width)).toEqual(
      slots.map(() => 'max(20.8px, 3ch + 4px)'),
    );
    expect(gap.style.width).toBe(slots[0]!.style.minWidth);

    // small round buttons
    expect(baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__page-button {'))).toMatch(
      /^[^}]*min-width: calc\(0\.65 \* var\(--param-control-height\)\);/,
    );
  });

  it('puts the page size at the very end of the footer, after the pager and a divider', async () => {
    renderNav();
    await loaded();

    const next = screen.getByRole('button', { name: 'Next page' });
    const pageSize = screen.getByRole('button', { name: / per page$/ });

    expect(next.compareDocumentPosition(pageSize) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pageSize.previousElementSibling?.classList.contains('data-table__toolbar-divider')).toBe(true);
    expect(pageSize.previousElementSibling?.previousElementSibling?.classList.contains('data-table__pager')).toBe(true);
  });

  it('shows the numbers only in a wide footer: a container query', () => {
    expect(baseStylesheet).toMatch(/container: data-table-footer \/ inline-size;/);
    expect(baseStylesheet).toMatch(
      /@container data-table-footer \(width < 28rem\) \{\s*\.data-table__pager-numbers \{\s*display: none;[^@]*\.data-table__pager-compact \{\s*display: inline;/,
    );
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
    expect(screen.getByText('1-25 of 60')).toBeTruthy();
  });

  // A source whose load of `slow` (a page, or a page size) waits until `finish` is called.
  const slowSource = (slow: (query: Spec.Query) => boolean) => {
    let finish = () => {};
    const source = vi.fn(async (query: Spec.Query): Promise<Spec.Result<Person>> => {
      if (slow(query)) {
        await new Promise<void>((resolve) => {
          finish = resolve;
        });
      }

      return { rows: people.slice((query.page - 1) * query.pageSize, query.page * query.pageSize), total: 60 };
    });

    return { source, finish: () => finish() };
  };

  it('keeps the footer at the rows shown while the next page loads, with a ring around the clicked page', async () => {
    const { source, finish } = slowSource((query) => query.page === 2);

    renderNav({ source });
    await loaded();
    click('Next page');

    // still the first page, until its rows are there
    expect(screen.getByText('1-10 of 60')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Page 1' }).getAttribute('aria-current')).toBe('page');

    // the ring, after the delay of the loading bar
    await waitFor(() => expect(screen.getByRole('button', { name: 'Page 2' }).hasAttribute('data-pending')).toBe(true));

    await act(async () => finish());
    await loaded();

    expect(screen.getByText('11-20 of 60')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Page 2' }).getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('button', { name: 'Page 2' }).hasAttribute('data-pending')).toBe(false);
  });

  it('keeps the page size shown while a new one loads, with a spinner in place of its chevron at once', async () => {
    const { source, finish } = slowSource((query) => query.pageSize === 25);

    renderNav({ source, pageSizeOptions: [10, 25] });
    await loaded();
    await choosePageSize(25);

    // at once, without the delay of the loading bar
    const trigger = screen.getByRole('button', { name: '10 per page' });

    expect(trigger.querySelector('.data-table__pending-spinner')).not.toBeNull();
    expect(trigger.querySelector('svg')).toBeNull();

    await act(async () => finish());
    await loaded();

    expect(screen.getByRole('button', { name: '25 per page' }).querySelector('.data-table__pending-spinner'))
      .toBeNull();
    expect(screen.getByText('1-25 of 60')).toBeTruthy();
  });

  it('changes nothing when the current page size is chosen: the page, the selection and the menu stay', async () => {
    const { source } = renderNav({ selection: 'multi', pageSizeOptions: [10, 25] });

    await loaded();
    click('Next page');
    await loaded();
    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

    const calls = source.mock.calls.length;

    await choosePageSize(10);

    expect(source.mock.calls.length).toBe(calls);
    expect(screen.getByText('11-20 of 60')).toBeTruthy();
    expect(screen.getByText('1 selected')).toBeTruthy();
    expect(screen.getByRole('menuitemradio', { name: '10' })).toBeTruthy();
  });

  it('does not show the footer when there is no result, and shows it again with rows', async () => {
    renderNav({ searchable: true });
    await loaded();

    expect(screen.getByRole('button', { name: / per page$/ })).toBeTruthy();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'zzz' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), { key: 'Enter' });

    expect(await screen.findByText('No results found')).toBeTruthy();
    expect(pageSizeButton()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
    expect(screen.queryByText('1-10 of 60')).toBeNull();

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), { key: 'Escape' });

    expect(await screen.findByRole('button', { name: / per page$/ })).toBeTruthy();
  });

  describe('footer', () => {
    // A source with `count` rows.
    const sourceOf = (count: number) => async (query: Spec.Query): Promise<Spec.Result<Person>> => ({
      rows: people.slice(0, count).slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
      total: count,
    });

    it('shows a range of one item without the dash: "1 of 1", also on a last page with one row', async () => {
      // the item range: the first side of the footer (the narrow pager's "1 of 1" is a page, not an item)
      const range = (container: HTMLElement) => container.querySelector('.data-table__footer-side')?.textContent;
      const { container, unmount } = renderNav({ source: sourceOf(1) });

      await loaded();
      expect(range(container)).toBe('1 of 1');
      unmount();

      // 21 rows, 10 per page: the third page has one
      const second = renderNav({ source: sourceOf(21) });

      await loaded();
      click('Page 3');
      await loaded();
      expect(range(second.container)).toBe('21 of 21');
    });

    it('is always there by default (with rows), and never with footer="never"', async () => {
      const { unmount } = renderNav({ source: sourceOf(4) });

      await loaded();
      expect(screen.getByText('1-4 of 4')).toBeTruthy();
      unmount();

      renderNav({ footer: 'never' });
      await loaded();
      expect(pageSizeButton()).toBeNull();
      expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();
    });

    it('is there with footer="auto" only when there is something to page or to choose', async () => {
      // 4 rows, page sizes from 10: nothing to page, nothing to choose.
      const { unmount } = renderNav({ footer: 'auto', source: sourceOf(4) });

      await loaded();
      expect(screen.getByText('Person 04')).toBeTruthy();
      expect(pageSizeButton()).toBeNull();
      unmount();

      // 12 rows on a page of 25, but a page size of 10 to choose: the footer is there.
      renderNav({ footer: 'auto', source: sourceOf(12), pageSize: 25 });
      await loaded();
      expect(screen.getByText('1-12 of 12')).toBeTruthy();
    });

    it('is there with footer="auto" when there is more than one page', async () => {
      renderNav({ footer: 'auto', pageSizeOptions: [10] });
      await loaded();

      expect(screen.getByText('1-10 of 60')).toBeTruthy();
    });
  });

  it('shows the footer only when at least one data row is shown, also not during the first load', async () => {
    renderNav();

    // first load: no row yet, so no footer
    expect(pageSizeButton()).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next page' })).toBeNull();

    await loaded();

    expect(screen.getByRole('button', { name: / per page$/ })).toBeTruthy();
  });

  it('keeps the footer while the rows of a page are replaced by a new load', async () => {
    let calls = 0;
    const source = (query: Spec.Query) =>
      ++calls === 1 ? createSource()(query) : new Promise<Spec.Result<Person>>(() => {});

    renderNav({ source });
    await loaded();

    click('Next page');

    expect(screen.getByRole('button', { name: / per page$/ })).toBeTruthy();
    expect(screen.getByText('Person 01')).toBeTruthy();
  });

  it('shows no action column and no details toggle column when no data row is shown', async () => {
    const { container } = renderNav({
      selection: 'multi',
      source: async () => ({ rows: [], total: 0 }),
      renderDetail: () => <span>detail</span>,
      actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
    });

    await screen.findByText('No entries');

    const template = container.querySelector<HTMLElement>('[role="table"]')?.style.gridTemplateColumns;

    // only the selection column is left besides the two data columns: one max-content, no action column
    expect(template).toBe('max-content minmax(0, 1fr) minmax(0, 1fr)');
    expect(screen.queryByRole('button', { name: 'Show all details' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
  });

  it('shows the action column and the details toggle column as soon as data rows are shown', async () => {
    renderNav({
      selection: 'multi',
      renderDetail: () => <span>detail</span>,
      actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
    });

    // first load: no row yet
    expect(screen.queryByRole('button', { name: 'Edit' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Show all details' })).toBeNull();

    await loaded();

    expect(screen.getByRole('button', { name: 'Show all details' })).toBeTruthy();
    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(10);
  });

  it('does not show the footer for a source without rows', async () => {
    renderNav({ source: async () => ({ rows: [], total: 0 }) });

    expect(await screen.findByText('No entries')).toBeTruthy();
    expect(pageSizeButton()).toBeNull();
  });

  it('shows an empty text when there are no rows', async () => {
    renderNav({ source: async () => ({ rows: [], total: 0 }) });

    expect(await screen.findByText('No entries')).toBeTruthy();
  });

  it('shows no icon in the default empty state, only the text', async () => {
    const { container } = renderNav({ source: async () => ({ rows: [], total: 0 }) });

    expect(await screen.findByText('No entries')).toBeTruthy();

    expect(container.querySelector('[role="cell"] svg')).toBeNull();
  });

  it('ends the empty state without a line below it (unlike the rows)', () => {
    // from the stylesheet itself: jsdom's CSSOM serializes `border-bottom: none` as `medium`
    expect(baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__empty-cell {'))).toMatch(
      /^[^}]*border-bottom: none;/,
    );
    expect(declarationsOf('.data-table__cell')).toMatch(/border-bottom: 1px solid var\(--param-color-divider\)/);
  });

  it('draws the lines between the rows and the line under the header in the same light color', () => {
    expect(declarationsOf('.data-table__cell')).toMatch(/border-bottom: 1px solid var\(--param-color-divider\)/);
    // the header takes the cell's line (it composes `.data-table__cell`), no color of its own
    expect(baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__header {'))).not.toMatch(
      /^[^}]*border-bottom-color/,
    );
  });

  it('replaces the default text with custom empty content', async () => {
    renderNav({ source: async () => ({ rows: [], total: 0 }), empty: <p>Nobody here yet</p> });

    expect(await screen.findByText('Nobody here yet')).toBeTruthy();

    expect(screen.queryByText('No entries')).toBeNull();
  });

  it('shows the empty content only when there are no rows', async () => {
    renderNav({ empty: <p>Nobody here yet</p> });

    await loaded();

    expect(screen.queryByText('Nobody here yet')).toBeNull();

    expect(screen.queryByText('No entries')).toBeNull();
  });

  describe('column filters', () => {
    const filteredColumns: readonly Spec.Column<Person>[] = [
      { key: 'name', header: 'Name', filter: textColumnFilter() },
      { key: 'city', header: 'City', filter: selectColumnFilter({ options: ['Vienna', 'Berlin'] }) },
    ];

    const nameBox = () => screen.getByRole('textbox', { name: 'Name' });

    const typeName = (text: string) => fireEvent.change(nameBox(), { target: { value: text } });

    // Skipped while the filter drawer prototype replaces the filter view (2026-10-09, `FILTER_SIDEBAR` in
    // DataTableView.tsx): it tests the filter view.
    it.skip('makes the filter view only as wide as its filters, ending at the filter button', async () => {
      render(<Nav source={createSource()} rowKey="id" columns={filteredColumns} />);
      await loaded();

      const view = await openFilters();

      // its own width, at most the room before the end of the button (no layout in jsdom: the button ends at the
      // table's end)
      expect(view.style.width).toMatch(/^calc\(/);
      expect(view.style.maxWidth).toBe('calc(100% - 0px)');
      expect(baseStylesheet).toMatch(/\.data-table__filter-view \{[^}]*justify-self: end;/);
    });

    const filteredWith = (source: ReturnType<typeof createSource>, filters: Spec.Query['filters'], timeout = 1000) =>
      waitFor(
        () => expect(source).toHaveBeenLastCalledWith(expect.objectContaining({ filters }), expect.any(AbortSignal)),
        { timeout },
      );

    const pillTexts = () =>
      [...document.querySelectorAll('.data-table__filter-pill-main')].map((pill) => pill.textContent);

    it('has no filter button when no column has a filter, and no filter row at all', async () => {
      const { container } = renderNav();

      await loaded();

      expect(screen.queryByRole('button', { name: 'Filters' })).toBeNull();
      expect(container.querySelector('.data-table__header-row input')).toBeNull();
    });

    // Skipped while the filter drawer prototype replaces the filter view (2026-10-09, `FILTER_SIDEBAR` in
    // DataTableView.tsx): it tests the filter view.
    it.skip('shows the filter view in place of the rows, with one row per filter and the header as its label', async () => {
      const { container } = renderNav({ columns: [...filteredColumns, { key: 'id', header: 'Id' }] });

      await loaded();

      // the filters are not in the header
      expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();

      const panel = await openFilters();

      // the grid and the footer stay, visible but faded (they keep their room, so the height stays) and inert; the view
      // lies in the same cell, as a sheet over their top; the toolbar stays, with the filter button pressed
      const stack = container.querySelector('.data-table__stack')!;
      const tableArea = container.querySelector<HTMLElement>('.data-table__table-area')!;

      expect(stack.hasAttribute('data-filtering')).toBe(true);
      expect(tableArea.contains(container.querySelector('.data-table__table'))).toBe(true);
      expect(tableArea.hasAttribute('inert')).toBe(true);
      expect(baseStylesheet).toMatch(/&\[data-filtering\] > \.data-table__table-area \{\s*opacity: 0\.8;/);
      expect(baseStylesheet).toMatch(/\.data-table__filter-view \{[^}]*align-self: start;/);
      // its height is animated (Web Animations, not in jsdom); meanwhile no min height, and the body does not scroll
      expect(baseStylesheet).toMatch(/&\[data-animating\] \{\s*min-height: 0;/);
      expect(panel.parentElement).toBe(stack);
      expect(screen.getByRole('button', { name: 'Filters' }).getAttribute('aria-pressed')).toBe('true');
      // no headline; below the filters Cancel and Apply (Reset and Clear only when they would change something)
      expect(within(panel).queryByText('Filters')).toBeNull();
      expect(panel.querySelector('.data-table__filter-panel-footer')?.textContent).toBe('CancelApply');
      expect([...panel.querySelectorAll('.data-table__filter-panel-label')].map((label) => label.textContent)).toEqual([
        'Name',
        'City',
      ]);
      expect(nameBox()).toBeTruthy();
      expect(filterField('City')).toBeTruthy();
      // the first filter has the focus
      expect(document.activeElement).toBe(nameBox());

      // Cancel brings the rows back, and the focus goes back to the filter button
      click('Cancel');
      expect(stack.hasAttribute('data-filtering')).toBe(false);
      expect(tableArea.hasAttribute('inert')).toBe(false);
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Filters' }));
    });

    it('shows the localized default placeholder in a text filter, or the one of the app', async () => {
      renderNav({
        columns: [
          { key: 'name', header: 'Name', filter: textColumnFilter() },
          { key: 'city', header: 'City', filter: textColumnFilter({ placeholder: 'e.g. Vienna' }) },
        ],
      });

      await loaded();
      await openFilters();

      expect(screen.getByRole('textbox', { name: 'Name' }).getAttribute('placeholder')).toBe('Filter');
      expect(screen.getByRole('textbox', { name: 'City' }).getAttribute('placeholder')).toBe('e.g. Vienna');
    });

    // Skipped while the filter drawer prototype replaces the filter view (2026-10-09, `FILTER_SIDEBAR` in
    // DataTableView.tsx): it tests the filter view.
    it.skip('applies nothing before Apply, then all filters at once, on the first page', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      click('Next page');
      await loaded();

      const calls = source.mock.calls.length;

      await openFilters();
      typeName('  person 0  ');
      await chooseFilterOption('City', 'Vienna');
      await new Promise((resolve) => setTimeout(resolve, 100));
      expect(source.mock.calls.length).toBe(calls);

      click('Apply');

      // the view closes, and the load starts; it only rolls up a moment longer (inert and hidden), then it is removed
      expect(screen.queryByRole('region', { name: 'Filters' })).toBeNull();
      expect(document.querySelector('[data-closing]')?.hasAttribute('inert')).toBe(true);
      await waitFor(() => expect(document.querySelector('[data-closing]')).toBeNull());

      await filteredWith(source, { name: { text: 'person 0', match: 'contains' }, city: 'Vienna' }, 300);
      expect(source.mock.calls.length).toBe(calls + 1);
      expect(source).toHaveBeenLastCalledWith(expect.objectContaining({ page: 1 }), expect.any(AbortSignal));
      // the badge of the filter button counts the active filters
      expect(screen.getByRole('button', { name: 'Filters' }).querySelector('.data-table__filter-badge')?.textContent)
        .toBe(
          '2',
        );
    });

    it('applies on Enter in a text input', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      typeName('person 07');
      fireEvent.keyDown(nameBox(), { key: 'Enter' });

      await filteredWith(source, { name: { text: 'person 07', match: 'contains' } }, 300);
    });

    it('throws the draft away when the popup is closed without Apply', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();

      const calls = source.mock.calls.length;

      await openFilters();
      typeName('person 07');
      fireEvent.keyDown(nameBox(), { key: 'Escape' });
      await waitFor(() => expect(screen.queryByRole('region', { name: 'Filters' })).toBeNull());
      expect(source.mock.calls.length).toBe(calls);

      await openFilters();
      expect((nameBox() as HTMLInputElement).value).toBe('');
    });

    it('closes on a click outside while nothing was changed, and that click does nothing else', async () => {
      const onClick = vi.fn();
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      document.body.addEventListener('click', onClick);
      fireEvent.pointerDown(document.body, { button: 0 });
      fireEvent.pointerUp(document.body, { button: 0 });
      fireEvent.click(document.body);
      await waitFor(() => expect(screen.queryByRole('region', { name: 'Filters' })).toBeNull());
      expect(onClick).not.toHaveBeenCalled();
      document.body.removeEventListener('click', onClick);
      expect(source.mock.calls.length).toBeGreaterThan(0);
    });

    it('stays open on a click outside once something was changed, and on a click inside', async () => {
      renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      fireEvent.pointerDown(nameBox(), { button: 0 });
      expect(screen.getByRole('region', { name: 'Filters' })).toBeTruthy();
      typeName('person 07');
      fireEvent.pointerDown(document.body, { button: 0 });
      expect(screen.getByRole('region', { name: 'Filters' })).toBeTruthy();
    });

    it('gives a plain text filter (no match select by default) `contains`', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      typeName('ber');
      expect(screen.queryByRole('combobox', { name: 'Match' })).toBeNull();
      click('Apply');
      await filteredWith(source, { name: { text: 'ber', match: 'contains' } }, 300);
    });

    it('lets a text filter with `matchModes` match the start or the end instead, and shows where other text may be', async () => {
      const { source } = renderNav({
        columns: [{ key: 'name', header: 'Name', filter: textColumnFilter({ matchModes: true }) }, filteredColumns[1]!],
      });

      await loaded();
      await openFilters();

      // a dot after the label of a filter set in the draft (its room always kept)
      const dotOf = (header: string) =>
        [...document.querySelectorAll('.data-table__filter-panel-label')].find((label) => label.textContent === header)!
          .querySelector('.data-table__filter-panel-dot')!;

      expect(dotOf('Name').hasAttribute('data-set')).toBe(false);
      typeName('ber');
      expect(dotOf('Name').hasAttribute('data-set')).toBe(true);
      // the select inside the text field, at its start, "contains" by default
      expect(
        document.querySelector('.data-table__prefixed-field')?.firstElementChild?.contains(
          screen.getByRole('combobox', { name: 'Match' }),
        ),
      )
        .toBe(true);
      const match = screen.getByRole('combobox', { name: 'Match' });

      expect(match.textContent).toBe('contains');
      await chooseIn(match, 'starts with');
      expect(match.textContent).toBe('starts with');
      click('Apply');

      await filteredWith(source, { name: { text: 'ber', match: 'startsWith' } }, 300);

      // the value in a box, the `⋯` only where other text may be (after it)
      const pill = document.querySelector('.data-table__filter-pill-main')!;

      expect(pill.textContent).toBe('Name:ber⋯');
      expect(pill.querySelector('[data-boxed]')?.textContent).toBe('ber');
    });

    it('puts the draft back to the applied filters with Reset, empties it with Clear; Apply applies it', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      typeName('person 07');
      click('Apply');
      await filteredWith(source, { name: { text: 'person 07', match: 'contains' } }, 300);
      await loaded();

      // Reset shown only while the draft differs from the applied filters, Clear (the × after the drawer's title) only
      // while the draft has a filter
      const inDrawer = (name: string) =>
        within(screen.getByRole('region', { name: 'Filters' })).queryByRole('button', { name }) as
          | HTMLButtonElement
          | null;
      const shown = (name: string) => {
        const button = inDrawer(name);

        return button !== null && !button.disabled;
      };

      await openFilters();
      expect([shown('Reset'), shown('Clear')]).toEqual([false, true]);

      typeName('person 08');
      expect([shown('Reset'), shown('Clear')]).toEqual([true, true]);

      click('Reset');
      expect((nameBox() as HTMLInputElement).value).toBe('person 07');
      expect([shown('Reset'), shown('Clear')]).toEqual([false, true]);

      fireEvent.click(inDrawer('Clear')!);
      expect((nameBox() as HTMLInputElement).value).toBe('');
      expect([shown('Reset'), shown('Clear')]).toEqual([true, false]);
      click('Apply');

      await filteredWith(source, {}, 300);
    });

    it('does not load again for equal filters', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      typeName('person 07');
      click('Apply');
      await filteredWith(source, { name: { text: 'person 07', match: 'contains' } }, 300);
      await loaded();

      const calls = source.mock.calls.length;

      // the same value once trimmed
      await openFilters();
      typeName('person 07 ');
      click('Apply');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(source.mock.calls.length).toBe(calls);
    });

    // Skipped while the filter drawer prototype replaces the filter view (2026-10-09, `FILTER_SIDEBAR` in
    // DataTableView.tsx): it tests the filter view.
    it.skip('shows a pill per active filter: its × removes the filter, Clear all removes them all', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      expect(document.querySelector('.data-table__filter-pills')).toBeNull();

      await openFilters();
      typeName('person');
      await chooseFilterOption('City', 'Berlin');
      click('Apply');
      await filteredWith(source, { name: { text: 'person', match: 'contains' }, city: 'Berlin' }, 300);
      await loaded();

      expect(pillTexts()).toEqual(['Name:⋯person⋯', 'City:Berlin']);

      // the pills stay while the filter view is shown, but are disabled
      await openFilters();
      expect(document.querySelector('.data-table__filter-pills')).not.toBeNull();
      expect(document.querySelector('.data-table__filter-pills')?.hasAttribute('inert')).toBe(true);
      click('Cancel');
      expect(document.querySelector('.data-table__filter-pills')?.hasAttribute('inert')).toBe(false);
      expect(pillTexts()).toEqual(['Name:⋯person⋯', 'City:Berlin']);

      fireEvent.click(screen.getAllByRole('button', { name: 'Remove filter' })[1]!);
      await filteredWith(source, { name: { text: 'person', match: 'contains' } }, 300);
      await loaded();
      expect(pillTexts()).toEqual(['Name:⋯person⋯']);

      click('Clear all');
      await filteredWith(source, {}, 300);
      await loaded();
      expect(document.querySelector('.data-table__filter-pills')).toBeNull();
    });

    it('starts with the default filters (only those of a column with a filter); Clear all removes them all', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const { source } = renderNav({
        columns: filteredColumns,
        defaultFilters: { city: 'Berlin', unknown: 'x' },
      });

      await loaded();

      expect(source).toHaveBeenCalledWith(
        { page: 1, pageSize: 10, sort: undefined, search: '', filters: { city: 'Berlin' } },
        expect.any(AbortSignal),
      );
      expect(pillTexts()).toEqual(['City:Berlin']);
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('unknown'));

      click('Clear all');
      await filteredWith(source, {}, 300);
      await loaded();
      expect(document.querySelector('.data-table__filter-pills')).toBeNull();
      warn.mockRestore();
    });

    it('opens the popup with the filter of a pill focused when the pill is clicked', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      await chooseFilterOption('City', 'Berlin');
      click('Apply');
      await filteredWith(source, { city: 'Berlin' }, 300);
      await loaded();

      fireEvent.click(document.querySelector('.data-table__filter-pill-main')!);

      await screen.findByRole('region', { name: 'Filters' });
      await waitFor(() => expect(document.activeElement).toBe(filterField('City')));
    });

    it('gives a multiple select filter an array of strings, and summarizes a long list in its pill', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        {
          key: 'city',
          header: 'City',
          filter: selectColumnFilter({ options: ['Vienna', 'Berlin', 'Lisbon', 'Madrid'], multiple: true }),
        },
      ];
      const { source } = renderNav({ columns });

      await loaded();
      await openFilters();
      await chooseFilterOption('City', 'Vienna');
      await chooseFilterOption('City', 'Berlin');
      click('Apply');
      await filteredWith(source, { city: ['Vienna', 'Berlin'] }, 300);
      expect(pillTexts()).toEqual(['City:Vienna, Berlin']);
      await loaded();

      await openFilters();
      await chooseFilterOption('City', 'Lisbon');
      click('Apply');
      await filteredWith(source, { city: ['Vienna', 'Berlin', 'Lisbon'] }, 300);
      expect(pillTexts()).toEqual(['City:Vienna+2']);
    });

    describe('autocomplete filter', () => {
      const cities = ['Vienna', 'Berlin', 'Bern', 'Lisbon'];
      const createLoad = () =>
        vi.fn(async (query: string) =>
          cities
            .filter((city) => city.toLowerCase().includes(query.toLowerCase()))
            .map((city) => ({ value: city.toLowerCase(), label: city }))
        );
      // Typed key by key: Base UI opens the list only for real input (a change without an input type is autofill).
      const typeInto = async (header: string, text: string) => {
        const input = filterField(header);

        await userEvent.clear(input);
        await userEvent.type(input, text);
      };

      it('loads its options while typing, from the minimum length on, and gives the chosen values', async () => {
        const load = createLoad();
        const columns: readonly Spec.Column<Person>[] = [
          { key: 'city', header: 'City', filter: autocompleteColumnFilter({ load, multiple: true }) },
        ];
        const { source } = renderNav({ columns });

        await loaded();
        await openFilters();
        await typeInto('City', 'Ber');
        fireEvent.click(await screen.findByRole('option', { name: 'Berlin' }, { timeout: 1000 }));
        expect(load).toHaveBeenLastCalledWith('Ber', expect.any(AbortSignal));
        await typeInto('City', 'Vi');
        fireEvent.click(await screen.findByRole('option', { name: 'Vienna' }, { timeout: 1000 }));
        click('Apply');
        await filteredWith(source, { city: ['berlin', 'vienna'] }, 300);
        expect(pillTexts()).toEqual(['City:Berlin, Vienna']);
      });

      it('shows the values as text by default, or up to `maxChips` chips and `+N`; Backspace removes the last one', async () => {
        const choose = async (header: string, query: string, option: string) => {
          await typeInto(header, query);
          fireEvent.click(await screen.findByRole('option', { name: option }, { timeout: 1000 }));
        };
        const columns: readonly Spec.Column<Person>[] = [
          { key: 'city', header: 'City', filter: autocompleteColumnFilter({ load: createLoad(), multiple: true }) },
          {
            key: 'name',
            header: 'Name',
            filter: autocompleteColumnFilter({ load: createLoad(), multiple: true, maxChips: 1 }),
          },
        ];
        const fieldOf = (header: string) => filterField(header).parentElement!;

        renderNav({ columns });

        await loaded();
        await openFilters();
        await choose('City', 'Ber', 'Berlin');
        await choose('City', 'Vi', 'Vienna');
        expect(fieldOf('City').textContent).toBe('Berlin, Vienna');
        expect(within(fieldOf('City')).queryAllByRole('button')).toEqual([]);
        // Without the click of `type`, which would open the list.
        await userEvent.type(filterField('City'), '{Backspace}', { skipClick: true });
        expect(fieldOf('City').textContent).toBe('Berlin');

        await choose('Name', 'Ber', 'Berlin');
        await choose('Name', 'Vi', 'Vienna');
        await choose('Name', 'Lis', 'Lisbon');
        expect(fieldOf('Name').textContent).toBe('Berlin+2');
        expect(within(fieldOf('Name')).getAllByRole('button', { name: /^Remove / }).length).toBe(1);

        await userEvent.clear(filterField('Name'));
        await userEvent.type(filterField('Name'), '{Backspace}', { skipClick: true });
        expect(fieldOf('Name').textContent).toBe('Berlin+1');
      });

      it('does not load below the minimum length, and says why', async () => {
        const load = createLoad();
        const columns: readonly Spec.Column<Person>[] = [
          { key: 'city', header: 'City', filter: autocompleteColumnFilter({ load, minQueryLength: 2 }) },
        ];

        renderNav({ columns });

        await loaded();
        await openFilters();
        await typeInto('City', 'B');
        expect(await screen.findByText('Type to search')).toBeTruthy();
        await new Promise((resolve) => setTimeout(resolve, 400));
        expect(load).not.toHaveBeenCalled();
      });

      it('aborts an older query, and shows a failed or empty load', async () => {
        const signals: AbortSignal[] = [];
        const load = vi.fn(async (query: string, signal: AbortSignal) => {
          signals.push(signal);

          if (query === 'x') {
            throw new Error('down');
          }

          return [];
        });
        const columns: readonly Spec.Column<Person>[] = [
          { key: 'city', header: 'City', filter: autocompleteColumnFilter({ load }) },
        ];

        renderNav({ columns });

        await loaded();
        await openFilters();
        await typeInto('City', 'x');
        expect(await screen.findByText('Could not load', {}, { timeout: 1000 })).toBeTruthy();
        await typeInto('City', 'xy');
        expect(await screen.findByText('No results found', {}, { timeout: 1000 })).toBeTruthy();
        expect(signals[0]?.aborted).toBe(true);
      });

      it('shows the label of a single value in its input, and Enter there chooses instead of applying', async () => {
        const load = createLoad();
        const columns: readonly Spec.Column<Person>[] = [
          { key: 'city', header: 'City', filter: autocompleteColumnFilter({ load }) },
        ];
        const { source } = renderNav({ columns });

        await loaded();
        await openFilters();
        await typeInto('City', 'Lis');
        await screen.findByRole('option', { name: 'Lisbon' }, { timeout: 1000 });
        fireEvent.keyDown(filterField('City'), { key: 'ArrowDown' });
        fireEvent.keyDown(filterField('City'), { key: 'Enter' });
        await waitFor(() => expect((filterField('City') as HTMLInputElement).value).toBe('Lisbon'));
        expect(screen.getByRole('region', { name: 'Filters' })).toBeTruthy();
        click('Apply');
        await filteredWith(source, { city: 'lisbon' }, 300);
        expect(pillTexts()).toEqual(['City:Lisbon']);
      });
    });

    it('shows the placeholder of a select filter only while nothing is selected', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        { key: 'city', header: 'City', filter: selectColumnFilter({ options: ['Vienna', 'Berlin'] }) },
        { key: 'name', header: 'Name', filter: selectColumnFilter({ options: ['Ann', 'Bob'], multiple: true }) },
      ];

      renderNav({ columns });

      await loaded();
      await openFilters();

      expect([shownIn('City'), shownIn('Name')]).toEqual(['All', 'All']);
      await chooseFilterOption('City', 'Vienna');
      expect([shownIn('City'), shownIn('Name')]).toEqual(['Vienna', 'All']);
      await chooseFilterOption('Name', 'Ann');
      expect([shownIn('City'), shownIn('Name')]).toEqual(['Vienna', 'Ann']);
    });

    it('gives a number range filter `{ from?, to? }`, inclusive, with an open side when one is empty', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        { key: 'id', header: 'Id', filter: numberRangeColumnFilter() },
      ];
      const { source } = renderNav({ columns });
      const side = (name: 'From' | 'To') => screen.getByRole('spinbutton', { name: `Id ${name}` });
      const apply = async (from: string, to: string, filters: Spec.Query['filters'], pill: string) => {
        await openFilters();
        fireEvent.change(side('From'), { target: { value: from } });
        fireEvent.change(side('To'), { target: { value: to } });
        click('Apply');
        await filteredWith(source, filters, 300);
        await loaded();
        expect(pillTexts()).toEqual([pill]);
      };

      await loaded();
      await apply('1000', '5000', { id: { from: 1000, to: 5000 } }, 'Id1,000–5,000');
      await apply('1000', '', { id: { from: 1000 } }, 'Id ≥1,000');
      await apply('', '5000', { id: { to: 5000 } }, 'Id ≤5,000');
      await apply('7', '7', { id: { from: 7, to: 7 } }, 'Id =7');
    });

    it('gives a boolean filter true or false, and All removes it', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        { key: 'id', header: 'Paid', filter: booleanColumnFilter() },
      ];
      const { source } = renderNav({ columns });

      await loaded();
      await openFilters();
      expect(screen.getByRole('radio', { name: 'All' }).getAttribute('aria-checked')).toBe('true');
      fireEvent.click(screen.getByRole('radio', { name: 'No' }));
      click('Apply');
      await filteredWith(source, { id: false }, 300);
      await loaded();
      expect(pillTexts()).toEqual(['Paid:No']);

      await openFilters();
      fireEvent.click(screen.getByRole('radio', { name: 'All' }));
      click('Apply');
      await filteredWith(source, {}, 300);
    });

    it('gives a date range filter the range picked in its two calendars, shows it formatted, and clears it', async () => {
      const columns: readonly Spec.Column<Person>[] = [
        { key: 'city', header: 'Moved in', filter: dateRangeColumnFilter() },
      ];

      const { source } = renderNav({ columns });

      await loaded();

      const trigger = () => screen.getByRole('button', { name: 'Moved in' });

      // Two calendars (vanillajs-datepicker, loaded on first use), side by side, acting as one of two months. They are
      // in a popover of the filter's own, inside the filter view.
      const open = async () => {
        if (screen.queryByRole('region', { name: 'Filters' }) === null) {
          await openFilters();
        }

        fireEvent.click(trigger());

        return waitFor(() => {
          const found = [...document.querySelectorAll<HTMLElement>('.datepicker')].map((calendar) =>
            calendar.parentElement!
          );

          expect(found).toHaveLength(2);

          return found as [HTMLElement, HTMLElement];
        });
      };
      const titleOf = (calendar: HTMLElement) => calendar.querySelector('.view-switch')?.textContent;
      // The days of the calendar's own month (the days of the adjacent months are hidden).
      const day = (calendar: HTMLElement, date: number) =>
        calendar.querySelectorAll<HTMLElement>('.datepicker-cell.day:not(.prev):not(.next)')[date - 1]!;
      const isoOf = (cell: HTMLElement) => {
        const date = new Date(Number(cell.dataset['date']));
        const pad = (value: number) => String(value).padStart(2, '0');

        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
      };
      const closed = () => waitFor(() => expect(document.querySelector('.datepicker')).toBeNull());

      await openFilters();
      expect(trigger().textContent).toBe('All');

      const [left, right] = await open();

      // Each calendar is named by its month title; the outer buttons by our texts (the inner ones are hidden by the
      // stylesheet). The left calendar always shows the month before the right one: they move together.
      expect(screen.getByRole('group', { name: titleOf(left)! })).toBe(left);

      const [leftTitle, rightTitle] = [titleOf(left), titleOf(right)];

      fireEvent.click(within(left).getByRole('button', { name: 'Previous' }));
      expect(titleOf(right)).toBe(leftTitle);

      fireEvent.click(within(right).getByRole('button', { name: 'Next' }));
      expect([titleOf(left), titleOf(right)]).toEqual([leftTitle, rightTitle]);

      // A range within one month: two clicks in the same calendar. The first one picks nothing yet.
      const [start, end] = [day(left, 14), day(left, 17)];

      fireEvent.click(start);
      expect(document.querySelector('.datepicker')).not.toBeNull();
      // Below the calendars: what is picked so far, while the end is still to come.
      expect(screen.getByText(/ – …$/)).toBeTruthy();

      // Until the second click, the range follows the mouse (the days between are highlighted), and goes when it leaves.
      fireEvent.mouseOver(end);
      expect(left.querySelectorAll('.datepicker-cell.range')).toHaveLength(2);
      fireEvent.mouseLeave(left);
      expect(left.querySelectorAll('.datepicker-cell.range')).toHaveLength(0);

      // The second click closes the calendars; the filter view stays, and Apply applies the range.
      fireEvent.click(end);
      await closed();
      expect(screen.getByRole('region', { name: 'Filters' })).toBeTruthy();
      expect(trigger().textContent).not.toBe('All');
      click('Apply');

      await filteredWith(source, { city: { from: isoOf(start), to: isoOf(end) } }, 300);
      await loaded();

      // An end before the start is swapped, across the two calendars.
      const [nextLeft, nextRight] = await open();
      const [later, earlier] = [day(nextRight, 3), day(nextLeft, 28)];

      fireEvent.click(later);
      fireEvent.click(earlier);
      await closed();
      click('Apply');

      await filteredWith(source, { city: { from: isoOf(earlier), to: isoOf(later) } }, 300);
      await loaded();

      // The same day twice: a range of one day.
      const [oneLeft] = await open();
      const single = day(oneLeft, 5);

      fireEvent.click(single);
      fireEvent.click(single);
      await closed();
      click('Apply');

      await filteredWith(source, { city: { from: isoOf(single), to: isoOf(single) } }, 300);
      await loaded();

      // The clear button below the calendars removes the range and closes the calendars.
      // (the filter view has a Clear button of its own)
      await open();
      fireEvent.click(
        within(document.querySelector<HTMLElement>('.data-table__date-range-footer')!).getByRole('button', {
          name: 'Clear',
        }),
      );
      await closed();
      expect(trigger().textContent).toBe('All');
      click('Apply');

      await filteredWith(source, {}, 300);
    });

    it('clears the selection when filters are applied', async () => {
      const { source } = renderNav({ columns: filteredColumns, selection: 'multi' });

      await loaded();
      await openFilters();
      typeName('person');
      click('Apply');
      await filteredWith(source, { name: { text: 'person', match: 'contains' } }, 300);
      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      expect(screen.getByText('1 selected')).toBeTruthy();
      // while the selection bar is shown (the filter button is not), a pill does not open the popup, but its × works
      expect(document.querySelector('button.data-table__filter-pill-main')).toBeNull();

      click('Remove filter');
      await filteredWith(source, {}, 300);
      await loaded();

      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('keeps the filter button usable while loading and blocks the rest of the table', async () => {
      let calls = 0;

      const source = (query: Spec.Query) =>
        ++calls === 1 ? createSource()(query) : new Promise<Spec.Result<Person>>(() => {});

      renderNav({ columns: filteredColumns, source });

      await loaded();
      await openFilters();
      typeName('person');
      click('Apply');

      // a new filter started a load that never ends
      expect(screen.getByText('Person 01').closest('[inert]')).not.toBeNull();
      expect(screen.getByRole('button', { name: 'Filters' }).closest('[inert]')).toBeNull();
      expect(screen.getByRole('button', { name: 'Next page' }).closest('[inert]')).not.toBeNull();
    });

    // Skipped while the filter drawer prototype replaces the filter view (2026-10-09, `FILTER_SIDEBAR` in
    // DataTableView.tsx): it tests the filter view.
    it.skip('disables everything of the bar but the filter button while the filter view is shown (the search stays apart)', async () => {
      renderNav({
        columns: [...filteredColumns, { key: 'id', header: 'Id', hideable: true }],
        searchable: true,
        reloadable: true,
        actions: [{ type: 'general', key: 'add', label: 'Add', onClick: vi.fn() }],
      });

      await loaded();

      const panel = await openFilters();
      const disabled = (element: HTMLElement) => element.closest('[inert]') !== null;

      // the search is not part of the filters: it stays in the toolbar, but cannot be used meanwhile
      expect(within(panel).queryByRole('textbox', { name: 'Search' })).toBeNull();
      expect(disabled(screen.getByRole('textbox', { name: 'Search' }))).toBe(true);
      expect(disabled(screen.getByRole('button', { name: 'Reload' }))).toBe(true);
      expect(disabled(screen.getByRole('button', { name: 'Add' }))).toBe(true);
      expect(disabled(screen.getByRole('button', { name: 'Columns' }))).toBe(true);
      expect(disabled(screen.getByRole('button', { name: 'Filters' }))).toBe(false);

      // back to the rows: everything is usable again
      click('Cancel');
      expect(disabled(screen.getByRole('textbox', { name: 'Search' }))).toBe(false);
      expect(disabled(screen.getByRole('button', { name: 'Add' }))).toBe(false);
      expect(disabled(screen.getByRole('button', { name: 'Columns' }))).toBe(false);
    });

    it('says that no rows match the filters, with a way to clear them', async () => {
      const { source } = renderNav({ columns: filteredColumns });

      await loaded();
      await openFilters();
      typeName('zzz');
      click('Apply');

      expect(await screen.findByText('No rows match these filters')).toBeTruthy();
      expect(pageSizeButton()).toBeNull();

      // the button of the empty state (the × after the filter button is named the same)
      const empty = document.querySelector<HTMLElement>('.data-table__empty-cell')!;

      fireEvent.click(within(empty).getByRole('button', { name: 'Clear filters' }));
      await filteredWith(source, {}, 300);
    });

    it('joins a × to the filter button while filters are active: it removes all of them', async () => {
      const { source } = renderNav({ columns: filteredColumns });
      const clear = () =>
        document.querySelector('.data-table__filter-button-group')?.querySelector<HTMLElement>(
          '[aria-label="Clear filters"]',
        )
          ?? null;

      await loaded();
      expect(clear()).toBeNull();

      await openFilters();
      typeName('person');
      await chooseFilterOption('City', 'Berlin');
      click('Apply');
      await filteredWith(source, { name: { text: 'person', match: 'contains' }, city: 'Berlin' }, 300);
      await loaded();

      fireEvent.click(clear()!);
      await filteredWith(source, {}, 300);
      await loaded();
      expect(clear()).toBeNull();
    });

    it('clears the filters with the × also while the filter view is shown, and closes the view', async () => {
      const { source } = renderNav({ columns: filteredColumns });
      const clear = () =>
        document.querySelector('.data-table__filter-button-group')?.querySelector<HTMLElement>(
          '[aria-label="Clear filters"]',
        )
          ?? null;

      await loaded();
      await openFilters();
      typeName('person');
      click('Apply');
      await filteredWith(source, { name: { text: 'person', match: 'contains' } }, 300);
      await loaded();

      await openFilters();
      fireEvent.click(clear()!);
      await filteredWith(source, {}, 300);
      await loaded();
      expect(screen.queryByRole('button', { name: 'Apply' })).toBeNull();
      expect(clear()).toBeNull();
    });
  });

  describe('reload button', () => {
    it('has a Reload button only when the component is reloadable', async () => {
      renderNav({ searchable: true });
      await loaded();

      expect(screen.queryByRole('button', { name: 'Reload' })).toBeNull();
    });

    it('puts the Reload button at the start of the bar, before the search box, also without a search box', async () => {
      const { unmount } = renderNav({ searchable: true, reloadable: true });
      await loaded();

      const reload = screen.getByRole('button', { name: 'Reload' });

      expect(
        reload.compareDocumentPosition(screen.getByRole('textbox', { name: 'Search' }))
          & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      unmount();

      const { container } = renderNav({
        reloadable: true,
        actions: [{ type: 'general', key: 'add', label: 'Add', onClick: vi.fn() }],
      });
      await loaded();

      // inside the first group of the bar (a fieldset without a box)
      expect(
        container.querySelector('.data-table__toolbar-bar > .data-table__toolbar-group')!.firstElementChild?.className,
      )
        .toBe('data-table__toolbar-reload');
    });

    it('loads the current page again, with the same query', async () => {
      const { source } = renderNav({ reloadable: true, selection: 'multi' });
      await loaded();

      const query = source.mock.lastCall![0];

      fireEvent.click(screen.getByRole('button', { name: 'Reload' }));

      await waitFor(() => expect(source).toHaveBeenCalledTimes(2));
      expect(source.mock.lastCall![0]).toEqual(query);
      await loaded();

      // while rows are selected, the selection bar has taken the place of the bar (and of the Reload button)
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      expect(screen.queryByRole('button', { name: 'Reload' })).toBeNull();
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

    it('puts the search box left of the action buttons (at the start of the bar)', async () => {
      renderNav({ searchable: true, actions: [{ type: 'general', key: 'add', label: 'Add', onClick: vi.fn() }] });

      await loaded();

      const add = screen.getByRole('button', { name: 'Add' });

      expect(searchBox().compareDocumentPosition(add) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

      expect(screen.getByText('1-9 of 9')).toBeTruthy();
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

    it('gives way to the selection bar while rows are selected, and comes back with the search kept', async () => {
      renderNav({ searchable: true, selection: 'multi' });

      await loaded();

      type('person');

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      expect(screen.queryByRole('textbox', { name: 'Search' })).toBeNull();

      clearSelectionWith('pill');

      expect((searchBox() as HTMLInputElement).value).toBe('person');
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
      renderNav({ actions: [{ type: 'multiRow', key: 'del', label: 'Delete', onClick: noop }] });

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

          actions: [{ type: 'multiRow', key: 'archive', label: 'Archive', onClick: noop }],
        }],
      });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 11, radios: 0 });
    });

    it('has no controls (single, the selected row is highlighted) for a row action in the toolbar, also when it is shown in both places', async () => {
      renderNav({ actions: [{ type: 'singleRow', key: 'open', label: 'Open', show: 'toolbar', onClick: noop }] });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 0 });

      cleanup();

      renderNav({ actions: [{ type: 'singleRow', key: 'open', label: 'Open', show: 'both', onClick: noop }] });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 0 });
    });

    it('has no controls (single) for a toolbar row action inside a menu', async () => {
      renderNav({
        actions: [{
          type: 'menu',

          key: 'more',

          label: 'More',

          actions: [{ type: 'singleRow', key: 'open', label: 'Open', show: 'toolbar', onClick: noop }],
        }],
      });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 0, radios: 0 });
    });

    it('has no selection for general actions and for row actions that only live in the action column', async () => {
      renderNav({
        actions: [
          { type: 'general', key: 'add', label: 'Add', onClick: noop },

          { type: 'singleRow', key: 'edit', label: 'Edit', onClick: noop },

          { type: 'singleRow', key: 'view', label: 'View', show: 'column', onClick: noop },
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
          { type: 'singleRow', key: 'open', label: 'Open', show: 'toolbar', onClick: noop },

          { type: 'multiRow', key: 'del', label: 'Delete', onClick: noop },
        ],
      });

      await loaded();

      expect(controls()).toEqual({ checkboxes: 11, radios: 0 });
    });
  });

  describe('selection', () => {
    it('selects rows with checkboxes and clears the selection when the page or the page size changes', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      expect(screen.getByText('1 selected')).toBeTruthy();

      click('Next page');
      await loaded();

      expect(screen.queryByText('1 selected')).toBeNull();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      expect(screen.getByText('1 selected')).toBeTruthy();

      await choosePageSize(25);
      await loaded();

      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('selects all rows of the page with the header checkbox, and deselects them again', async () => {
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

    it('clears the selection with Escape and with the selection pill of the selection bar', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      fireEvent.keyDown(screen.getAllByRole('checkbox', { name: 'Deselect row' })[0]!, { key: 'Escape' });
      expect(screen.queryByText('1 selected')).toBeNull();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      clearSelectionWith('pill');
      expect(screen.queryByText('1 selected')).toBeNull();
    });

    it('allows only one selected row, without a selection column', async () => {
      renderNav({ selection: 'single' });
      await loaded();

      expect(screen.queryAllByRole('radio')).toHaveLength(0);
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);

      clickCell('Person 01');
      clickCell('Person 02');

      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(isSelected('Person 01')).toBe(false);
      expect(isSelected('Person 02')).toBe(true);
    });

    it('selects with Space and moves the selection with the arrow keys, in single mode', async () => {
      renderNav({ selection: 'single' });
      await loaded();

      const rowOf = (name: string) => screen.getByText(name).closest<HTMLElement>('[role="row"]')!;

      fireEvent.keyDown(rowOf('Person 01'), { key: ' ' });
      expect(isSelected('Person 01')).toBe(true);

      fireEvent.keyDown(rowOf('Person 01'), { key: 'ArrowDown' });
      expect(isSelected('Person 02')).toBe(true);
      expect(isSelected('Person 01')).toBe(false);
      expect(document.activeElement).toBe(rowOf('Person 02'));
    });

    it('has no selection controls by default', async () => {
      renderNav();
      await loaded();

      expect(screen.queryByRole('checkbox')).toBeNull();
      expect(screen.queryByRole('radio')).toBeNull();
    });
  });

  // Row click selects on all of a data cell (its free space, its text, custom content), but not on a control in it.
  const cellOf = (text: string) => screen.getByText(text).closest<HTMLElement>('[role="cell"]')!;
  const clickCell = (text: string, init?: MouseEventInit) => fireEvent.click(cellOf(text), init);
  const isSelected = (text: string) => cellOf(text).closest('[role="row"]')?.getAttribute('aria-selected') === 'true';
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
    it('selects on all of a data cell, its text and custom content too, but never on a control in it', async () => {
      const { container } = renderNav({
        selection: 'multi',
        columns: [
          { key: 'name', header: 'Name' },
          {
            key: 'city',
            header: 'City',
            render: (person) => (
              <span>
                <em>{person.city}</em>
                <button type="button">{`Map ${person.id}`}</button>
              </span>
            ),
          },
        ],
      });
      await loaded();

      // a click on a control in the cell is the control's
      fireEvent.click(screen.getByRole('button', { name: 'Map 1' }));
      expect(screen.queryByText('1 selected')).toBeNull();

      // a click on what a custom `render` drew counts like one on the cell
      fireEvent.click(screen.getAllByText('Vienna')[0]!);
      expect(screen.getByText('1 selected')).toBeTruthy();

      // the plain text of a cell has an element of its own, but a click on it counts like one on the cell
      const text = screen.getByText('Person 01');

      expect(text.getAttribute('role')).toBeNull();
      expect(text.closest('[role="cell"]')).not.toBe(text);

      fireEvent.click(text);
      expect(screen.getByText('1 selected')).toBeTruthy();

      // and so does the free space of the cell
      clickCell('Person 02');
      expect(screen.getByText('1 selected')).toBeTruthy();

      expect(container.querySelector('.data-table__data-row > [data-control]')).toBeNull();
    });

    it('selects from the free space of the meta cells, but never from the action cell', async () => {
      const { container } = renderNav({
        selection: 'multi',
        renderDetail: (person) => <span>{`detail ${person.id}`}</span>,
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });
      await loaded();

      const cellsOfFirstRow = [...container.querySelector('.data-table__data-row')!.children] as HTMLElement[];
      const [selectionCell, detailsCell] = cellsOfFirstRow;
      const actionCell = cellsOfFirstRow[cellsOfFirstRow.length - 1]!;

      // only the action cell is a control cell, so the pointer rule covers the other two
      expect(selectionCell!.matches('.data-table__cell:not([data-control])')).toBe(true);
      expect(detailsCell!.matches('.data-table__cell:not([data-control])')).toBe(true);
      expect(actionCell.matches('.data-table__cell:not([data-control])')).toBe(false);

      // the free space of the selection cell is a click on the checkbox: it toggles and keeps the others
      fireEvent.click(selectionCell!);
      expect(screen.getByText('1 selected')).toBeTruthy();

      const selectionCellOfSecondRow = container.querySelectorAll('.data-table__data-row')[1]!.children[0]!;
      fireEvent.click(selectionCellOfSecondRow);
      expect(screen.getByText('2 selected')).toBeTruthy();

      fireEvent.click(selectionCellOfSecondRow);
      fireEvent.click(selectionCell!);
      expect(screen.queryByText('1 selected')).toBeNull();

      // the free space of the select-all cell is a click on the select-all checkbox
      const selectAllCell = screen.getByRole('checkbox', { name: 'Select all rows' }).parentElement!;
      fireEvent.click(selectAllCell);
      expect(screen.getByRole('checkbox', { name: 'Deselect all rows' })).toBeTruthy();

      fireEvent.click(selectAllCell);
      expect(screen.queryByText(/selected/)).toBeNull();

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

      const detailRow = screen.getByText('detail 1').closest<HTMLElement>('.data-table__detail-row')!;
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

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Deselect row' })[0]!);
      expect(screen.queryByText('1 selected')).toBeNull();

      fireEvent.click(beside[0]!);
      expect(screen.getByText('1 selected')).toBeTruthy();

      // the detail row selects the row it belongs to, not another one
      fireEvent.click(detailCell);
      expect(container.querySelectorAll('.data-table__data-row[aria-selected="true"]')).toHaveLength(1);
    });

    it('selects only the clicked row in multi mode, toggles with Ctrl/Cmd, extends with Shift', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      // no timers are involved: the row reacts in the same tick as the click
      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();

      clickCell('Person 02');
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(isSelected('Person 01')).toBe(false);
      expect(isSelected('Person 02')).toBe(true);

      clickCell('Person 01', { ctrlKey: true });
      expect(screen.getByText('2 selected')).toBeTruthy();

      clickCell('Person 01', { metaKey: true });
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(isSelected('Person 01')).toBe(false);

      // a plain click is the anchor of Shift + click
      clickCell('Person 01');
      clickCell('Person 03', { shiftKey: true });
      expect(screen.getByText('3 selected')).toBeTruthy();
    });

    it('still toggles with the checkbox in multi mode', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 01');

      const checkbox = within(cellOf('Person 02').closest<HTMLElement>('[role="row"]')!)
        .getByRole('checkbox', { name: 'Select row' });

      fireEvent.click(checkbox);
      expect(screen.getByText('2 selected')).toBeTruthy();

      fireEvent.click(checkbox);
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(isSelected('Person 01')).toBe(true);
    });

    it('selects the row in single mode and keeps it selected when clicked again', async () => {
      renderNav({ selection: 'single' });
      await loaded();

      clickCell('Person 01');
      clickCell('Person 01');

      expect(isSelected('Person 01')).toBe(true);
      expect(screen.getByText('1 selected')).toBeTruthy();

      clickCell('Person 02');

      expect(isSelected('Person 01')).toBe(false);
      expect(isSelected('Person 02')).toBe(true);
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
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
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
          actions: [{ type: 'singleRow', key: 'archive', label: 'Archive', onClick: onArchive }],
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
      type: 'singleRow' as const,
      key: 'edit',
      label: 'Edit',
      default: true,
      onClick,
    });

    it('runs the default action on the free space of a row, with that row', async () => {
      const edit = vi.fn();

      renderNav({ selection: 'multi', actions: [editAction(edit)] });
      await loaded();

      doubleClickCell('Person 02');
      expect(edit).toHaveBeenCalledTimes(1);
      expect(edit.mock.calls[0]![0]).toMatchObject({ name: 'Person 02' });

      // on the plain text of a cell too, and its second mouse down selects no word
      const text = screen.getByText('Person 01');

      expect(fireEvent.mouseDown(text, { detail: 2 })).toBe(false);
      fireEvent.doubleClick(text, { detail: 2 });
      expect(edit).toHaveBeenCalledTimes(2);
      expect(edit.mock.calls[1]![0]).toMatchObject({ name: 'Person 01' });
    });

    it('selects only the double clicked row, and nothing changes back in between', async () => {
      const edit = vi.fn();

      renderNav({ selection: 'multi', actions: [editAction(edit)] });
      await loaded();

      clickCell('Person 02');
      clickCell('Person 03', { ctrlKey: true });
      expect(screen.getByText('2 selected')).toBeTruthy();

      const cell = cellOf('Person 01');

      // the first click selects only this row, at once: there is no waiting and no guessed threshold anywhere
      fireEvent.click(cell, { detail: 1 });
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(isSelected('Person 01')).toBe(true);

      // the rest of the double click keeps that selection, so the row does not flash
      fireEvent.mouseDown(cell, { detail: 2 });
      expect(isSelected('Person 01')).toBe(true);
      fireEvent.click(cell, { detail: 2 });
      fireEvent.doubleClick(cell, { detail: 2 });

      expect(edit).toHaveBeenCalledTimes(1);
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(isSelected('Person 01')).toBe(true);
    });

    it('selects the double clicked row, in single mode', async () => {
      const edit = vi.fn();

      renderNav({ actions: [{ ...editAction(edit), show: 'toolbar' as const }] });
      await loaded();

      clickCell('Person 01');
      expect(screen.getByText('1 selected')).toBeTruthy();

      doubleClickCell('Person 02');

      expect(edit).toHaveBeenCalledTimes(1);
      expect(edit.mock.calls[0]![0]).toMatchObject({ name: 'Person 02' });
      expect(isSelected('Person 01')).toBe(false);
      expect(isSelected('Person 02')).toBe(true);
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

    it('works on the empty space of a detail that fills its cell, not on its text or its controls', async () => {
      const edit = vi.fn();

      renderNav({
        selection: 'multi',
        actions: [editAction(edit)],
        renderDetail: (person) => (
          <div data-testid={`block-${person.id}`}>
            <p>{`detail ${person.id}`}</p>
            <button type="button">More</button>
          </div>
        ),
      });
      await loaded();

      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);

      // On the text and on the control: theirs.
      fireEvent.doubleClick(screen.getByText('detail 1'), { detail: 2 });
      fireEvent.doubleClick(screen.getByRole('button', { name: 'More' }), { detail: 2 });
      expect(edit).not.toHaveBeenCalled();

      // On the block around them: the empty space, the same as the cell.
      fireEvent.click(screen.getByTestId('block-1'), { detail: 1 });
      expect(isSelected('Person 01')).toBe(true);

      fireEvent.doubleClick(screen.getByTestId('block-1'), { detail: 2 });
      expect(edit).toHaveBeenCalledTimes(1);
      expect(edit.mock.calls[0]![0]).toMatchObject({ name: 'Person 01' });
    });

    it('does nothing without an action marked default, and takes the first one that is', async () => {
      const plain = vi.fn();

      const { unmount } = renderNav({
        selection: 'multi',
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: plain }],
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
          { type: 'singleRow', key: 'a', label: 'A', default: true, onClick: first },
          { type: 'singleRow', key: 'b', label: 'B', default: true, onClick: second },
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
      renderNav({
        selection: 'multi',
        actions: [editAction(vi.fn())],
        columns: [
          { key: 'name', header: 'Name' },
          {
            key: 'city',
            header: 'City',
            render: (person) => (
              <span>
                <em>{person.city}</em>
                <button type="button">{`Map ${person.id}`}</button>
              </span>
            ),
          },
        ],
      });
      await loaded();

      const down = (element: HTMLElement, detail: number) => fireEvent.mouseDown(element, { detail });

      // the second mouse down on the free space of a cell or on its plain text: no word selection behind what the
      // action opens
      expect(down(cellOf('Person 01'), 2)).toBe(false);
      expect(down(screen.getByText('Person 01'), 2)).toBe(false);

      // and on what a custom `render` drew, but not on a control in it
      expect(down(screen.getAllByText('Vienna')[0]!, 2)).toBe(false);
      expect(down(screen.getByRole('button', { name: 'Map 1' }), 2)).toBe(true);

      // a single mouse down is never suppressed
      expect(down(cellOf('Person 01'), 1)).toBe(true);
    });

    it('leaves the word selection alone when no action is marked default', async () => {
      renderNav({ actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }] });
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

      clickCell('Person 03', { ctrlKey: true });
      expect(screen.getByText('3 selected')).toBeTruthy();

      shiftClick('Person 05');
      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('keeps the rows outside the range and makes the shift-clicked row the new anchor', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      clickCell('Person 01');
      clickCell('Person 04', { ctrlKey: true });
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

    it('toggles the row without an anchor and on the anchor row itself', async () => {
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

      // only Person 15: the page change cleared the selection and the anchor, so it is a normal click, not a range
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
      const rules = sourceRules()
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
      const ruleFor = (selector: string) => rules.find((rule) => rule.selectorText === selector);

      // the detail row has no top border, whatever the state, and keeps the height it had with one
      const detail = ruleFor('.data-table__detail-row > .data-table__cell');

      expect(detail?.style.borderTopStyle).toBe('none');
      expect(detail?.style.marginTop).toBe('0px');

      // and the data row above it gives up its bottom line, by color only, so nothing shifts
      const above = ruleFor('.data-table__data-row:has(+ .data-table__detail-row) > .data-table__cell');

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
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
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
      expect(dataRow.classList.contains('data-table__data-row')).toBe(true);
      expect(detailRow.classList.contains('data-table__detail-row')).toBe(true);
      expect(detailRow.classList.contains('data-table__data-row')).toBe(false);

      // jsdom has no :hover, so the pointer is simulated with a class.
      const selectors = selectorsInMedia(/hover:\s*hover/)
        .filter((selector) => selector.includes('data-table__data-row') || selector.includes('data-table__detail-row'))
        .flatMap((selector) => selector.split(/,\s*/))
        // (the rules for the checkbox of a hovered row are about the checkbox, not the row's cells)
        .filter((selector) => !selector.includes('.data-table__check'))
        .map((selector) => selector.replaceAll(':hover', '.pointer'));

      expect(selectors.length).toBeGreaterThan(0);

      const highlighted = (hovered: HTMLElement) => {
        hovered.classList.add('pointer');

        const cells = new Set(selectors.flatMap((selector) => [...document.querySelectorAll(selector)]));

        hovered.classList.remove('pointer');

        return cells;
      };

      const cellsOf = (row: HTMLElement) => [...row.querySelectorAll('.data-table__cell')];
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
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
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

      renderNav({ actions: [{ type: 'singleRow', key: 'edit', icon: icon('edit'), tip: 'Edit user', onClick }] });

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

    it('shows a row action in the action column as the table says (rowActionLook: icon by default, label, both)', async () => {
      const onClick = vi.fn();
      const info: Spec.RowAction<Person> = {
        type: 'singleRow',
        key: 'info',
        label: 'Information',
        icon: icon('info'),
        show: 'both',
        onClick,
      };
      const inRows = () =>
        screen.getAllByRole('button', { name: 'Information' }).filter((button) =>
          button.getAttribute('data-placement') === 'row'
        );

      const { unmount } = renderNav({ selection: 'multi', actions: [info] });
      await loaded();

      // the default: only the icon in the rows, named (and tipped) by the label
      expect(inRows()).toHaveLength(10);
      expect(inRows().every((button) => button.hasAttribute('data-icon-only') && button.textContent === '')).toBe(true);

      // the same action in the selection bar (one row selected) keeps its look: icon and label
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      const inToolbar = screen.getAllByRole('button', { name: 'Information' }).find((button) =>
        button.getAttribute('data-placement') === 'toolbar'
      )!;

      expect(inToolbar.hasAttribute('data-icon-only')).toBe(false);
      expect(inToolbar.textContent).toBe('Information');
      fireEvent.click(inToolbar);
      expect(onClick).toHaveBeenLastCalledWith(people[0]);
      unmount();

      // only the label
      const labels = renderNav({ selection: 'multi', actions: [info], rowActionLook: 'label' });
      await loaded();
      expect(inRows()[0]!.textContent).toBe('Information');
      expect(inRows()[0]!.querySelector('[data-testid="icon-info"]')).toBeNull();
      labels.unmount();

      // icon and label
      renderNav({ selection: 'multi', actions: [info], rowActionLook: 'iconAndLabel' });
      await loaded();
      expect(inRows()[0]!.textContent).toBe('Information');
      expect(inRows()[0]!.querySelector('[data-testid="icon-info"]')).not.toBeNull();
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
      const rowsAction: Spec.Action<Person> = { type: 'multiRow', key: 'r', label: 'Action R', onClick: noop };

      const first = renderNav({ actions: [menu(general('a', 'Action A'), separator(), rowsAction)] });

      await loaded();

      open();

      expect(await screen.findByRole('menuitem', { name: 'Action A' })).toBeTruthy();

      expect(screen.queryByRole('menuitem', { name: 'Action R' })).toBeNull();

      expect(screen.queryAllByRole('separator')).toHaveLength(0);

      first.unmount();

      // (the selection bar has no general actions, so the menu starts with another rows action here)
      const otherRowsAction: Spec.Action<Person> = { type: 'multiRow', key: 'q', label: 'Action Q', onClick: noop };

      renderNav({ actions: [menu(otherRowsAction, separator(), rowsAction)] });

      await loaded();

      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      open();

      expect(await screen.findByRole('menuitem', { name: 'Action Q' })).toBeTruthy();
      expect(screen.getByRole('menuitem', { name: 'Action R' })).toBeTruthy();

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
      const rowsAction: Spec.Action<Person> = { type: 'multiRow', key: 'r', label: 'Action R', onClick: noop };

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
          { type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() },

          { type: 'singleRow', key: 'remove', label: 'Remove', variant: 'danger', onClick: vi.fn() },

          { type: 'singleRow', key: 'open', label: 'Open', variant: 'primary', onClick: vi.fn() },
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

  describe('context menu', () => {
    const contextActions = (calls: string[]): readonly (Spec.Action<Person> | Spec.ActionMenu<Person>)[] => [
      { type: 'general', key: 'add', label: 'Add', onClick: () => calls.push('add') },
      {
        type: 'multiRow',
        key: 'remove',
        label: 'Remove',
        onClick: (rows) => calls.push(`remove ${rows.map((row) => row.id)}`),
      },
      { type: 'singleRow', key: 'edit', label: 'Edit', show: 'column', onClick: (row) => calls.push(`edit ${row.id}`) },
      { type: 'singleRow', key: 'info', tip: 'Info', icon: <svg />, show: 'column', onClick: () => {} },
      {
        type: 'menu',
        key: 'export',
        label: 'Export',
        actions: [
          { type: 'general', key: 'all', label: 'All', onClick: () => calls.push('all') },
          { type: 'multiRow', key: 'selected', label: 'Selected', onClick: () => calls.push('selected') },
        ],
      },
    ];
    // The entries of the open menu, separators as '---'.
    const entries = () =>
      [...screen.getByRole('menu').querySelectorAll('[role="menuitem"], [role="separator"]')].map((element) =>
        element.getAttribute('role') === 'separator' ? '---' : element.textContent
      );
    const openOn = async (text: string) => {
      fireEvent.contextMenu(screen.getByText(text));
      await screen.findByRole('menu');
    };

    it('shows the actions of the clicked row, then those of the selection, then the general ones', async () => {
      renderNav({ actions: contextActions([]) });

      await loaded();
      await openOn('Person 03');

      // An icon-only action shows its tip; a menu is a submenu at the end.
      expect(entries()).toEqual(['Edit', 'Info', '---', 'Remove', '---', 'Add', 'Export']);

      // One entry has an icon: every entry gets the icon's place (empty where it has none), so the texts line up.
      const menu = screen.getByRole('menu');

      expect(menu.classList.contains('data-table__menu-with-icons')).toBe(true);
      expect(menu.querySelectorAll('[role="menuitem"] > .data-table__menu-icon')).toHaveLength(5);
      expect(menu.querySelectorAll('.data-table__menu-icon svg')).toHaveLength(1);
    });

    it('leaves an action with contextMenu: false out of the menu (e.g. one that does the same as another)', async () => {
      renderNav({
        actions: [
          { type: 'multiRow', key: 'remove', label: 'Remove', onClick: () => {} },
          { type: 'singleRow', key: 'remove-row', label: 'Remove this', contextMenu: false, onClick: () => {} },
          { type: 'singleRow', key: 'edit', label: 'Edit', onClick: () => {} },
        ],
      });

      await loaded();
      // it is still in the action column (checked before the menu opens: the menu hides the rest from the a11y tree)
      expect(screen.getAllByRole('button', { name: 'Remove this' })).toHaveLength(10);

      await openOn('Person 03');

      expect(entries()).toEqual(['Edit', '---', 'Remove']);
    });

    it('selects only the clicked row when it is not selected, keeps the selection on a selected row', async () => {
      const calls: string[] = [];

      renderNav({ actions: contextActions(calls) });

      await loaded();
      // The first two rows (a selected row's checkbox is "Deselect row", so the next one is the first "Select row").
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

      // On a selected row: the selection stays, and the menu is about all selected rows (no single-row actions).
      await openOn('Person 02');

      expect(entries()).toEqual(['Remove', '---', 'Add', 'Export']);

      fireEvent.click(screen.getByRole('menuitem', { name: 'Remove' }));

      expect(calls).toEqual(['remove 1,2']);
      expect(screen.getByText('2 selected')).toBeTruthy();

      // On a row that is not selected: it becomes the only selected one, and its single-row actions are there.
      await openOn('Person 05');

      expect(entries()).toEqual(['Edit', 'Info', '---', 'Remove', '---', 'Add', 'Export']);

      fireEvent.click(screen.getByRole('menuitem', { name: 'Edit' }));
      await openOn('Person 05');
      fireEvent.click(screen.getByRole('menuitem', { name: 'Remove' }));

      expect(calls).toEqual(['remove 1,2', 'edit 5', 'remove 5']);
      expect(screen.getByText('1 selected')).toBeTruthy();
    });

    it('leaves the browser its own menu outside the rows, on selected text, and without actions', async () => {
      const { unmount } = renderNav({ actions: contextActions([]) });

      await loaded();

      // The header.
      expect(fireEvent.contextMenu(screen.getByText('Name'))).toBe(true);
      expect(screen.queryByRole('menu')).toBeNull();

      // Text selected in the row (to copy it).
      const cell = screen.getByText('Person 03');
      const range = document.createRange();

      range.selectNodeContents(cell);
      // addRange is ignored while the selection has a range already (also a collapsed one, e.g. from a focus).
      document.getSelection()!.removeAllRanges();
      document.getSelection()!.addRange(range);
      expect(fireEvent.contextMenu(cell)).toBe(true);
      expect(screen.queryByRole('menu')).toBeNull();
      document.getSelection()!.removeAllRanges();

      unmount();

      // No actions at all.
      renderNav();

      await loaded();

      expect(fireEvent.contextMenu(screen.getByText('Person 03'))).toBe(true);
      expect(screen.queryByRole('menu')).toBeNull();
    });
  });

  describe('actions', () => {
    const onAdd = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    const actions: readonly Spec.Action<Person>[] = [
      { type: 'general', key: 'add', label: 'Add', onClick: onAdd },
      { type: 'singleRow', key: 'edit', label: 'Edit', show: 'both', onClick: onEdit },
      { type: 'multiRow', key: 'delete', label: 'Delete', onClick: onDelete },
    ];

    it('shows toolbar actions only when the matching number of rows is selected', async () => {
      renderNav({ selection: 'multi', actions });
      await loaded();

      expect(screen.getByRole('button', { name: 'Add' })).toBeTruthy();
      expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull();
      expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(10);

      const boxes = screen.getAllByRole('checkbox', { name: 'Select row' });

      // the selection bar: the actions on the selection instead of the general ones
      fireEvent.click(boxes[0]!);
      expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
      expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(11);
      expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();

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

    it('shows a row action only for the rows it is visible for (visible), everywhere', async () => {
      const visit = vi.fn();
      const details = vi.fn();
      const actions: readonly Spec.Action<Person>[] = [
        {
          type: 'singleRow',
          key: 'visit',
          label: 'Visit',
          show: 'both',
          default: true,
          visible: (row) => row.city === 'Vienna',
          onClick: visit,
        },
        { type: 'singleRow', key: 'details', label: 'Details', default: true, onClick: details },
      ];

      renderNav({ actions });
      await loaded();

      // the action column: only the five rows of Vienna (of ten) have it
      expect(screen.getAllByRole('button', { name: 'Visit' })).toHaveLength(5);
      expect(screen.getByText('Person 02').closest('[role="row"]')!.textContent).not.toContain('Visit');

      // the default action: the first one marked that is visible for the row
      doubleClickCell('Person 01');
      expect(visit).toHaveBeenLastCalledWith(people[0]);
      doubleClickCell('Person 02');
      expect(details).toHaveBeenLastCalledWith(people[1]);
      expect(visit).toHaveBeenCalledTimes(1);

      // the selection bar (one row selected, by a click; the double click on Person 02 selected it): only for a row it
      // is visible for
      expect(screen.getByText('1 selected')).toBeTruthy();
      expect(screen.getAllByRole('button', { name: 'Visit' })).toHaveLength(5);
      clickCell('Person 01');
      expect(screen.getAllByRole('button', { name: 'Visit' })).toHaveLength(6);

      // the context menu of a row
      fireEvent.contextMenu(screen.getByText('Person 02'));
      expect(await screen.findByRole('menuitem', { name: 'Details' })).toBeTruthy();
      expect(screen.queryByRole('menuitem', { name: 'Visit' })).toBeNull();
    });

    it('lists the actions of a menu and hides a menu without visible actions', async () => {
      const menu: Spec.ActionMenu<Person> = {
        type: 'menu',
        key: 'more',
        label: 'More',
        actions: [{ type: 'multiRow', key: 'archive', label: 'Archive', onClick: vi.fn() }],
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
    it('shows a faint icon on an unsorted sortable column, and the arrow on the sorted one', async () => {
      renderNav({
        columns: [
          { key: 'name', header: 'Name', sortable: true },
          { key: 'city', header: 'City', sortable: true },
          { key: 'id', header: 'Id' },
        ],
      });
      await loaded();

      const iconIn = (name: string) =>
        screen.getByRole('columnheader', { name }).querySelector('.data-table__unsorted-icon');

      expect(iconIn('Name')).not.toBeNull();
      expect(iconIn('City')).not.toBeNull();
      expect(iconIn('Id')).toBeNull();
      expect(declarationsOf('.data-table__unsorted-icon')).toMatch(/opacity:\s*0\.45/);

      click('Name');
      await loaded();

      expect(iconIn('Name')).toBeNull();
      expect(iconIn('City')).not.toBeNull();
      // the sorted column is the only one in the full text color
      expect(screen.getByRole('columnheader', { name: 'Name' }).hasAttribute('data-sorted')).toBe(true);
      expect(screen.getByRole('columnheader', { name: 'City' }).hasAttribute('data-sorted')).toBe(false);

      // Not sorted: the two heads of the arrows only (two paths, no shaft); sorted: one arrow.
      const pathsIn = (name: string) => screen.getByRole('columnheader', { name }).querySelectorAll('svg path');
      expect(pathsIn('City')).toHaveLength(2);
      expect(pathsIn('Name')).toHaveLength(1);
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

    it('resizes a column by dragging its handle, and resets it by a double click', async () => {
      const measured = mockHeaderWidths({ Name: 100, City: 300 });

      renderNav();
      await loaded();

      const table = screen.getByRole('table');
      const handle = screen.getByRole('columnheader', { name: /Name/ }).querySelector<HTMLElement>(
        '.data-table__resizer',
      )!;

      handle.setPointerCapture = vi.fn();
      expect(table.style.gridTemplateColumns).toBe('minmax(0, 1fr) minmax(0, 1fr)');

      fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
      // only the dragged column changes (100 + 200): the others are fixed at their width when the drag starts
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 300 });
      expect(table.style.gridTemplateColumns).toBe('300px 300px');

      // not narrower than the minimum
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: -500 });
      expect(table.style.gridTemplateColumns).toBe('64px 300px');

      fireEvent.pointerUp(handle, { pointerId: 1 });
      fireEvent.pointerMove(handle, { pointerId: 1, clientX: 400 });
      expect(table.style.gridTemplateColumns).toBe('64px 300px');

      // the handle does not sort the column
      fireEvent.click(handle);
      expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort')).toBe('none');

      // a double click gives that column its own width back
      fireEvent.doubleClick(handle);
      expect(table.style.gridTemplateColumns).toBe('minmax(0, 1fr) 300px');
      measured.mockRestore();
    });

    it('has no handle on a column with resizable: false', async () => {
      renderNav({
        columns: [
          { key: 'name', header: 'Name', resizable: false },
          { key: 'city', header: 'City' },
        ],
      });
      await loaded();

      expect(screen.getByRole('columnheader', { name: 'Name' }).querySelector('.data-table__resizer')).toBeNull();
      expect(screen.getByRole('columnheader', { name: 'City' }).querySelector('.data-table__resizer')).not.toBeNull();
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

        const truncated = header.querySelector('.data-table__group-title, .data-table__header-text');

        expect(truncated).not.toBeNull();

        // jsdom computes no styles of a `@scope` rule: read the rule of the stylesheet
        const rule = declarationsOf(`.${truncated!.className}`);

        expect(rule).toMatch(/white-space: nowrap/);
        expect(rule).toMatch(/text-overflow: ellipsis/);
        expect(rule).toMatch(/overflow: hidden/);
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

      expect(screen.getByRole('columnheader', { name: 'City' }).classList.contains('data-table__header-sub')).toBe(
        true,
      );

      expect(container.querySelectorAll('.data-table__header-filler')).toHaveLength(1);

      expect(container.querySelector('.data-table__header-filler')?.getAttribute('role')).toBe('presentation');
      expect(screen.getByRole('columnheader', { name: 'Name' }).classList.contains('data-table__header-sub')).toBe(
        true,
      );
      expect(person.classList.contains('data-table__group-header')).toBe(true);
      expect(person.style.gridColumn).toBe('1 / span 1');
    });

    it('reserves the space of the vertical scrollbar of the rows area', async () => {
      const { container } = renderNav();
      await loaded();

      expect(container.querySelector('.data-table__scroller')).not.toBeNull();
      expect(declarationsOf('.data-table__scroller')).toMatch(/overflow-y:\s*auto/);
      expect(declarationsOf('.data-table__scroller')).toMatch(/scrollbar-gutter:\s*stable/);
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
      expect(group.classList.contains('data-table__group-header')).toBe(true);
      // the line is a pseudo-element inset by the radius, so neighboring lines are 2 × the radius apart
      expect(baseStylesheet).toMatch(
        /\.data-table__group-header,\s*\.data-table__header-filler \{[^}]*border-bottom: 1px solid transparent;\s*&::after \{[^}]*inset-inline: var\(--param-radius\);[^}]*height: 1px;[^}]*background-color: var\(--param-color-border\);/,
      );
      expect(declarationsOf('.data-table__group-title')).not.toMatch(/border/);
    });

    it('centers the select-all checkbox in the header without groups, and keeps it at the bottom with groups', async () => {
      const { unmount } = renderNav({ selection: 'multi' });
      await loaded();

      const headerRowOf = () => screen.getAllByRole('row')[0]!;

      expect(headerRowOf().hasAttribute('data-groups')).toBe(false);
      unmount();

      renderNav({
        selection: 'multi',
        columns: [{ header: 'Group', columns: [{ key: 'name', header: 'Name' }] }, { key: 'id', header: 'Id' }],
      });
      await loaded();

      expect(headerRowOf().hasAttribute('data-groups')).toBe(true);
      expect(baseStylesheet).toMatch(
        /\.data-table__header-row:not\(\[data-groups\]\) > \.data-table__header-tall:has\(> \.data-table__check\) \{\s*align-items: center;/,
      );
    });

    it('draws the line below the upper header row over all data columns, also under the fillers', async () => {
      renderNav({
        columns: [
          { header: 'Group', columns: [{ key: 'name', header: 'Name' }] },
          { key: 'city', header: 'City' },
        ],
      });
      await loaded();

      expect(declarationsOf('.data-table__header-filler')).not.toMatch(/border-bottom:\s*none/);
      // the fillers get the same inset line as the group headers
      expect(baseStylesheet).toMatch(/\.data-table__group-header,\s*\.data-table__header-filler \{/);
    });

    it('has no vertical line anywhere in the header, with groups or without', async () => {
      const { container } = renderNav({
        selection: 'multi',
        renderDetail: () => <span>detail</span>,
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
        columns: [
          { key: 'id', header: 'Id', filter: textColumnFilter() },
          { header: 'Group A', columns: [{ key: 'name', header: 'Name' }] },
          { header: 'Group B', columns: [{ key: 'city', header: 'City' }] },
        ],
      });
      await loaded();

      const header = container.querySelector('.data-table__header-row')!;

      // the group header row and the column header row are both there (the filters are in the popup) ...
      expect(header.querySelectorAll('.data-table__group-header')).toHaveLength(2);
      expect(header.querySelectorAll('.data-table__header-filler')).toHaveLength(1);

      // ... and none of them has a vertical line: not between groups, not above an ungrouped column
      expect(header.querySelectorAll('[data-separator]')).toHaveLength(0);
    });

    it('draws a divider only before the action column, in the rows, not after the meta columns', async () => {
      const { container } = renderNav({
        selection: 'multi',
        renderDetail: () => <span>detail</span>,
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });

      await loaded();

      // one per data row (no header cell), none after the meta columns
      expect(container.querySelectorAll('[data-divider="start"]')).toHaveLength(10);
      expect(container.querySelectorAll('[data-divider="end"]')).toHaveLength(0);
      expect(container.querySelector('[role="columnheader"][data-divider]')).toBeNull();

      // the detail row continues it
      click('Show all details');
      expect(container.querySelectorAll('[data-divider="start"]')).toHaveLength(20);
    });

    it('marks only data rows for the hover highlight, not detail rows', async () => {
      const { container } = renderNav({ renderDetail: () => <span>detail</span> });

      await loaded();
      fireEvent.click(screen.getAllByRole('button', { name: 'Show details' })[0]!);

      // the header row, 10 data rows and the expanded detail row
      expect(container.querySelectorAll('[role="row"]')).toHaveLength(12);
      expect(container.querySelectorAll('.data-table__data-row')).toHaveLength(10);
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

      const scroller = container.querySelector('.data-table__scroller');

      expect(scroller).not.toBeNull();
      expect(scroller?.contains(screen.getByText('Person 01'))).toBe(true);
      expect(scroller?.contains(screen.getByRole('columnheader', { name: 'City' }))).toBe(true);
      expect(scroller?.contains(screen.getByText('Users'))).toBe(false);
      expect(scroller?.contains(screen.getByText('1-10 of 60'))).toBe(false);
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
      const headerRows = new Set(headers.map((header) => header.closest('.data-table__header-row')));

      expect(headers).toHaveLength(4);
      expect(headerRows.size).toBe(1);
      expect(headerRows.has(null)).toBe(false);
      expect([...headerRows][0]?.getAttribute('role')).toBe('row');
    });

    it('reports the selection appearance, accent by default', async () => {
      const { container, rerender } = renderNav({ selection: 'multi' });
      await loaded();

      const appearanceOf = () =>
        container.querySelector('[data-selection-appearance]')?.getAttribute('data-selection-appearance');

      expect(appearanceOf()).toBe('accent');

      rerender(
        <Nav
          source={createSource()}
          rowKey="id"
          columns={columns}
          actions={[selectionActions.multi]}
          selectionAppearance="neutral"
        />,
      );
      expect(appearanceOf()).toBe('neutral');
    });

    it('frames selected rows with a line on top and at the bottom: gray, or in the selection border color with accent', async () => {
      renderNav({ selection: 'multi' });
      await loaded();

      // jsdom does not compute this: read the rules of the stylesheet
      const rules = sourceRules()
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
      const textOf = (selector: string) =>
        rules.filter((rule) => rule.selectorText === selector).map((rule) => rule.cssText).join(' ');
      const base = textOf('.data-table__cell[data-selected]');
      const accent = textOf(':where([data-selection-appearance=\'accent\']) .data-table__cell[data-selected]');

      // every selected row: a gray line on top and at the bottom, the top one overlapping the line of the row above
      expect(base).toMatch(/margin-top:\s*-1px/);
      expect(base).toMatch(/border-top:\s*1px solid var\(--param-color-border\)/);
      expect(base).toMatch(/border-bottom-color:\s*var\(--param-color-border\)/);
      // accent: the same lines in the selection border color, only slightly darker than the background
      expect(accent).toMatch(/border-top-color:\s*var\(--param-color-selected-border\)/);
      expect(accent).toMatch(/border-bottom-color:\s*var\(--param-color-selected-border\)/);
      expect(accent).not.toMatch(/var\(--param-color-primary\)/);
      // the first row has no top line: the line below the header is right above it
      expect(baseStylesheet).toMatch(
        /\.data-table__header-row \+ \.data-table__row > \.data-table__cell\[data-selected\] \{\s*margin-top: 0;\s*border-top: none;/,
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

      const striped = () =>
        [...container.querySelectorAll('.data-table__data-row')].map((row) => row.hasAttribute('data-stripe'));

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
      const rules = sourceRules()
        .filter((rule): rule is CSSStyleRule => rule instanceof CSSStyleRule);
      const selectorsFor = (needle: string) =>
        rules.filter((rule) => rule.selectorText.includes(needle)).map((rule) => rule.selectorText);

      // the detail row of a striped row is tinted with it
      expect(selectorsFor('data-stripe').some((selector) => selector.includes('data-table__detail-row'))).toBe(true);
      // the header has no gray band in any mode: it shows the surface color, so striped mode needs no rule for it
      expect(selectorsFor('data-striped').some((selector) => selector.includes('data-table__header'))).toBe(false);
      expect(baseStylesheet).toMatch(/\n\.data-table__header \{[^}]*background-color: var\(--param-color-surface\);/);
      expect(baseStylesheet).not.toMatch(/linear-gradient\(var\(--param-color-surface-strong\)/);

      // the zebra only changes the background: no rule of striped mode touches the lines between the rows
      expect(
        rules.some((rule) =>
          rule.selectorText.includes('data-striped')
          && (rule.style.borderBottomColor !== '' || rule.style.borderBottom !== '')
        ),
      ).toBe(false);
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

    it('gives a column with a CSS length as its width that width, and the others share the rest', async () => {
      const { container } = renderNav({
        columns: [
          { key: 'id', header: '#', width: '3rem' },
          { key: 'name', header: 'Name', width: 3 },
        ],
      });

      await loaded();

      const table = container.querySelector<HTMLElement>('[role="table"]');

      expect(table?.style.gridTemplateColumns).toBe('3rem minmax(0, 3fr)');
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
      expect(screen.queryByLabelText('Loading…')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Some UI libraries show their spinner one timer tick later than the data table asks for it.
      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByLabelText('Loading…')).toBeTruthy();

      await act(async () => resolve({ rows: [], total: 0 }));

      expect(container.querySelector('[inert]')).toBeNull();
      expect(screen.queryByLabelText('Loading…')).toBeNull();
    });

    it('places the loading overlay below the header and dims only the rows', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      let resolve: (result: Spec.Result<Person>) => void = () => {};
      const source = () => new Promise<Spec.Result<Person>>((done) => (resolve = done));
      const { container } = renderNav({ source });
      const root = container.querySelector('[aria-busy]')!;

      expect(root.hasAttribute('data-dimmed')).toBe(false);
      expect(container.querySelector('.data-table__overlay')).toBeNull();

      act(() => {
        vi.advanceTimersByTime(250);
      });

      const overlay = container.querySelector('.data-table__overlay')!;
      const header = container.querySelector('.data-table__header-row')!;

      expect(root.hasAttribute('data-dimmed')).toBe(true);
      expect(overlay).not.toBeNull();
      expect(overlay.parentElement).toBe(container.querySelector('.data-table__scroll-area'));
      expect(overlay.contains(header)).toBe(false);
      expect(header.contains(overlay)).toBe(false);

      // the rows are dimmed by the stylesheet: everything inside a row, but never the header row
      expect(declarationsOf('.data-table[data-dimmed] .data-table__row > *')).toMatch(/opacity:\s*0\.3/);
      expect(header.classList.contains('data-table__row')).toBe(false);

      await act(async () => resolve({ rows: [], total: 0 }));

      expect(container.querySelector('.data-table__overlay')).toBeNull();
      expect(root.hasAttribute('data-dimmed')).toBe(false);
    });

    it('gives the rows area a minimum height, and shows a thin gray bar at its top instead of a spinner', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });

      const { container } = renderNav({ source: () => new Promise<Spec.Result<Person>>(() => {}) });

      // no rows yet (first load): the table must not collapse to the header alone
      expect(container.querySelectorAll('[role="row"]')).toHaveLength(1);
      expect(declarationsOf('.data-table__scroll-area')).toMatch(/min-height:\s*calc\(6\s*\*/);

      act(() => {
        vi.advanceTimersByTime(250);
      });

      // the bar, in the overlay (which starts below the header), in the accent color
      const bar = screen.getByRole('status', { name: 'Loading…' });

      expect(bar.classList.contains('data-table__loading-bar')).toBe(true);
      expect(bar.parentElement?.classList.contains('data-table__overlay')).toBe(true);
      expect(declarationsOf('.data-table__loading-bar')).toMatch(/background-color: var\(--param-color-selected\)/);
      expect(baseStylesheet).not.toMatch(/\.spinner/);
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

        expect(container.querySelector<HTMLElement>('.data-table__overlay')?.style.top).toBe('48px');
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
    // One adapter for every instance.
    const shared = (adapter: Spec.I18nAdapter) => ({ type: 'factory', getAdapter: () => adapter }) as const;

    it('uses the translations of the adapter and falls back to English for missing ones', async () => {
      const German = createDataTableComponent({
        i18n: shared(adapterOf({ perPage: '{count} pro Seite', pageOf: '{page} von {pages}' })),
      });

      render(<German source={createSource()} rowKey="id" columns={columns} pageSize={10} />);

      expect(await screen.findByRole('button', { name: / pro Seite$/ })).toBeTruthy();
      expect(screen.getByText('1 von 6')).toBeTruthy();
      expect(screen.getByText('1-10 of 60')).toBeTruthy();
    });

    it('asks the adapter with the namespace, the key, the raw params and the English text filled in', async () => {
      const resolveText = vi.fn((_: string, __: string, ___: unknown, defaultValue: string) => defaultValue);
      const Tracked = createDataTableComponent({
        i18n: shared({ currentLocale: () => 'en-US', resolveText }),
      });

      render(<Tracked source={createSource()} rowKey="id" columns={columns} pageSize={10} />);
      await loaded();

      expect(resolveText).toHaveBeenCalledWith('dataTable', 'pageSize', null, 'Page Size');
      expect(resolveText).toHaveBeenCalledWith(
        'dataTable',
        'itemRange',
        { from: 1, to: 10, total: 60 },
        '1-10 of 60',
      );
    });

    it('translates the default placeholder of a text filter', async () => {
      const German = createDataTableComponent({ i18n: shared(adapterOf({ filterPlaceholder: 'Filtern' })) });
      const filtered: readonly Spec.Column<Person>[] = [
        { key: 'name', header: 'Name', filter: textColumnFilter() },
      ];

      render(<German source={createSource()} rowKey="id" columns={filtered} pageSize={10} />);
      await loaded();
      await openFilters();

      expect((await screen.findByRole('textbox', { name: 'Name' })).getAttribute('placeholder')).toBe('Filtern');
    });

    it('formats numbers in the locale of the adapter', async () => {
      const German = createDataTableComponent({ i18n: shared(adapterOf({}, 'de-DE')) });
      const many = async (query: Spec.Query) => ({ ...(await createSource()(query)), total: 12345 });

      render(<German source={many} rowKey="id" columns={columns} pageSize={10} />);

      expect(await screen.findByText('1-10 of 12.345')).toBeTruthy();
    });

    it('refreshes its texts when the adapter reports a change of the language', async () => {
      let language = 'en';
      let notify = () => {};
      const Switching = createDataTableComponent({
        i18n: shared({
          currentLocale: () => language,
          resolveText: (_, key, __, defaultValue) =>
            language === 'de' && key === 'perPage' ? '10 pro Seite' : defaultValue,
          onChange: (listener) => {
            notify = listener;

            return () => {};
          },
        }),
      });

      render(<Switching source={createSource()} rowKey="id" columns={columns} pageSize={10} />);

      expect(await screen.findByRole('button', { name: / per page$/ })).toBeTruthy();

      language = 'de';
      act(() => notify());

      expect(await screen.findByRole('button', { name: / pro Seite$/ })).toBeTruthy();
    });

    it('asks an i18n factory once per instance, with its root element, and renders its texts', async () => {
      const getAdapter = vi.fn((_element: HTMLElement) => adapterOf({ perPage: '{count} pro Seite' }));
      const German = createDataTableComponent({ i18n: { type: 'factory', getAdapter } });

      render(<German source={createSource()} rowKey="id" columns={columns} pageSize={10} />);

      expect(await screen.findByRole('button', { name: / pro Seite$/ })).toBeTruthy();
      expect(getAdapter).toHaveBeenCalledTimes(1);
      expect(getAdapter.mock.calls[0]?.[0].contains(screen.getByRole('button', { name: / pro Seite$/ }))).toBe(true);
    });

    it('calls an i18n hook in each instance, so each one follows its nearest provider', async () => {
      const Language = createContext<Readonly<Record<string, string>>>({});
      const Localized = createDataTableComponent({
        i18n: { type: 'hook', useAdapter: () => adapterOf(useContext(Language)) },
      });

      render(
        <>
          <Localized source={createSource()} rowKey="id" columns={columns} pageSize={10} />
          <Language value={{ perPage: '{count} pro Seite' }}>
            <Localized source={createSource()} rowKey="id" columns={columns} pageSize={10} />
          </Language>
        </>,
      );

      expect(await screen.findByRole('button', { name: / pro Seite$/ })).toBeTruthy();
      expect(screen.getByRole('button', { name: / per page$/ })).toBeTruthy();
    });

    it('throws a TypeError for an unknown i18n type (e.g. an adapter given directly)', () => {
      const adapter = adapterOf({});

      expect(() => createDataTableComponent({ i18n: adapter as unknown as Spec.Config['i18n'] })).toThrow(
        TypeError,
      );
    });
  });
});

describe('theming', () => {
  const keys = [
    'colorText',
    'colorTextDimmed',
    'colorSurface',
    'colorSurfaceStrong',
    'colorBorder',
    'colorDivider',
    'colorHover',
    'colorHoverAccent',
    'colorSelected',
    'colorSelectedBorder',
    'colorPrimary',
    'colorPrimaryHover',
    'colorOnPrimary',
    'colorDanger',
    'colorFocus',
    'focusRingWidth',
    'focusRingOffset',
    'radius',
    'buttonRadius',
    'shadow',
    'shadowSm',
    'fontFamily',
    'fontSize',
    'fontSizeSm',
    'fontWeightBold',
    'spacingXs',
    'spacingSm',
    'spacingMd',
    'controlHeight',
    'buttonHeight',
  ];

  // `colorTextDimmed` → `--param-color-text-dimmed`
  const propertyOf = (key: string) => `--param-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;

  const rootOf = (container: HTMLElement) => container.firstElementChild as HTMLElement;
  // The stylesheet of the root's theme (see core/stylesheet.ts).
  const stylesheetOf = (root: HTMLElement) => {
    // the scope starts at the root's parent (see `scopeOf` in core/stylesheet.ts)
    const scope = `@scope (:has(> [data-data-table-theme='${root.dataset.dataTableTheme}']))`;

    return [...document.querySelectorAll('style')].find((style) => style.textContent.includes(scope))?.textContent;
  };

  it.each(
    [['default', defaultTheme], ['soft', softTheme], ['Mantine', mantineTheme], ['Ant Design', antdTheme]] as const,
  )(
    'has a value for every design value in the %s theme',
    (_, theme) => {
      expect(Object.keys(theme)).toEqual(keys);
    },
  );

  it('puts the values of the default theme into its stylesheet, a light and a dark color with light-dark()', async () => {
    const { container } = render(<Nav source={createSource()} rowKey="id" columns={columns} />);

    await loaded();

    const root = rootOf(container);
    const css = stylesheetOf(root);

    // no custom properties of our own: not on the root, not in the stylesheet
    expect(root.getAttribute('style')).toBeNull();
    expect(css).toBeDefined();
    expect(css).not.toMatch(/--param-/);
    expect(css).toMatch(/\.data-table__toolbar-heading \{[^}]*\}/);
    expect(css).toMatch(/color: light-dark\(#111, #f5f5f5\)/);
    expect(css).toMatch(/border-radius: 2px/);
  });

  it('gives every button a focus ring in the theme\'s color, width and offset', async () => {
    const Themed = createDataTableComponent({ theme: { focusRingWidth: '3px', focusRingOffset: '1px' } });
    const { container } = render(<Themed source={createSource()} rowKey="id" columns={columns} />);

    await loaded();

    expect(baseStylesheet).toMatch(
      /:is\(\.data-table__button, \.data-table__icon-button, \.data-table__sort-button, \.data-table__clear-button\):focus-visible \{\s*outline: var\(--param-focus-ring-width\) solid var\(--param-color-focus\);\s*outline-offset: var\(--param-focus-ring-offset\);/,
    );
    expect(stylesheetOf(rootOf(container))).toMatch(
      /outline: 3px solid light-dark\(#0a5cc2, #78b0ff\);\s*outline-offset: 1px;/,
    );
  });

  it('takes the values of its theme, and the default theme for the missing ones', async () => {
    const Themed = createDataTableComponent({ theme: { colorText: 'rebeccapurple', radius: '2px' } });
    const { container } = render(<Themed source={createSource()} rowKey="id" columns={columns} />);

    await loaded();

    const css = stylesheetOf(rootOf(container));

    expect(css).toMatch(/color: rebeccapurple/);
    expect(css).toMatch(/light-dark\(#c6c6c6, #474747\)/);
    // a stylesheet of its own: the default theme's text color is not in it
    expect(css).not.toMatch(/light-dark\(#111, #f5f5f5\)/);
  });

  it('only reads its custom properties in the stylesheet: it sets none, has no hard-coded color, and mixes colors only when pressed', () => {
    const used = new Set([...baseStylesheet.matchAll(/var\((--param-[a-z-]+)\)/g)].map((match) => match[1]));
    const known = keys.map(propertyOf);

    expect([...used].filter((property) => !known.includes(property!))).toEqual([]);
    expect(baseStylesheet).not.toMatch(/--param-[a-z-]+\s*:/);
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

  it('opens the page size menu inside the root, so it gets the tokens of the theme', async () => {
    render(<Nav source={createSource()} rowKey="id" columns={columns} pageSizeOptions={[10, 25]} />);
    await loaded();

    fireEvent.click(screen.getByRole('button', { name: / per page$/ }));

    const menu = await screen.findByRole('menu', { name: / per page$/ });

    // inside the root, which its theme's stylesheet is scoped to
    expect(menu.closest('.data-table')?.hasAttribute('data-data-table-theme')).toBe(true);
    expect(screen.getAllByRole('menuitemradio').map((option) => option.textContent)).toEqual(['10', '25']);
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
    await openFilters();

    expect(shownIn('City')).toBe('All');

    await chooseFilterOption('City', 'Berlin');
    expect(screen.queryAllByRole('option').map((option) => option.textContent)).toEqual([]);
    click('Apply');
    await waitFor(() => expect(filtered()).toEqual({ city: 'Berlin' }));
    await loaded();

    await openFilters();
    fireEvent.click(filterField('City'));
    expect((await screen.findAllByRole('option')).map((option) => option.textContent)).toEqual([
      'All',
      'Vienna',
      'Berlin',
    ]);
    // the checkmark sits in front of the chosen option, and its room is kept on every option
    const marks = screen.getAllByRole('option').map((option) => option.firstElementChild);

    expect(marks.every((mark) => mark?.classList.contains('data-table__select-check'))).toBe(true);
    expect(marks.map((mark) => mark?.querySelector('svg') !== null)).toEqual([false, false, true]);

    await chooseFilterOption('City', 'All');
    expect(shownIn('City')).toBe('All');
    click('Apply');
    await waitFor(() => expect(filtered()).toEqual({}));
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
    await openFilters();

    await chooseFilterOption('City', 'Vienna');
    await chooseFilterOption('City', 'Berlin');

    // no "All" option in a multiple select, and the list is still open
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Vienna', 'Berlin']);
    // every option shows a checkbox in front, only as a picture of its state
    const boxes = screen.getAllByRole('option').map((option) => option.firstElementChild);

    expect(boxes.every((box) => box instanceof HTMLInputElement && box.type === 'checkbox')).toBe(true);
    expect(boxes.map((box) => (box as HTMLInputElement).checked)).toEqual([true, true]);
    expect(boxes.every((box) => box?.getAttribute('aria-hidden') === 'true' && box.getAttribute('tabindex') === '-1'))
      .toBe(true);
    expect(shownIn('City')).toBe('Vienna, Berlin');

    click('Apply');
    await waitFor(() => expect(filtered()).toEqual({ city: ['Vienna', 'Berlin'] }));
  });
});

describe('toolbar', () => {
  const add = { type: 'general', key: 'add', label: 'Add', onClick: vi.fn() } as const;
  const remove = { type: 'multiRow', key: 'remove', label: 'Remove', onClick: vi.fn() } as const;

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

    const heading = container.querySelector('.data-table__toolbar-heading')!;
    const bar = container.querySelector('.data-table__toolbar-bar')!;

    expect(heading.textContent).toBe('UsersAll of them');
    expect(heading.nextElementSibling).toBe(bar);
    expect(bar.contains(screen.getByRole('button', { name: 'Add' }))).toBe(true);
    expect(container.querySelector('.data-table__title-total')).toBeNull();
  });

  it('shows the total of the rows after the title with showTotal, from the last load', async () => {
    const { container } = render(
      <Nav source={createSource()} rowKey="id" columns={columns} title="Users" showTotal searchable />,
    );
    await loaded();

    expect(container.querySelector('.data-table__title')!.textContent).toBe('Users60');
    expect(container.querySelector('.data-table__title-total')!.textContent).toBe('60');

    const search = screen.getByPlaceholderText('Search');
    fireEvent.change(search, { target: { value: 'Person 0' } });
    fireEvent.keyDown(search, { key: 'Enter' });
    await waitFor(() => expect(container.querySelector('.data-table__title-total')!.textContent).toBe('9'));
  });

  it('puts Reload and the search box on the left, then the free space, the filter button, a divider and the actions', async () => {
    const filtered: readonly Spec.Column<Person>[] = [
      { key: 'name', header: 'Name', filter: textColumnFilter() },
    ];
    const { container } = render(
      <Nav source={createSource()} rowKey="id" columns={filtered} searchable reloadable actions={[add]} />,
    );
    await loaded();

    // The groups of the bar (fieldsets without a box) count by their content.
    const parts = [...container.querySelector('.data-table__toolbar-bar')!.children].flatMap((part) =>
      part.classList.contains('data-table__toolbar-group') ? [...part.children] : [part]
    );

    expect(parts.map((part) => part.className)).toEqual([
      'data-table__toolbar-reload',
      'data-table__search-field',
      'data-table__toolbar-spacer',
      'data-table__filter-button-group',
      'data-table__toolbar-divider',
      'data-table__toolbar-actions',
      'data-table__toolbar-divider',
      'data-table__toolbar-actions', // the column menu
    ]);
    expect(rulesOf('data-table__toolbar-spacer')).toMatch(/flex: 1 1 auto/);
    // the search box grows up to a maximum width
    expect(rulesOf('data-table__toolbar-bar')).toMatch(/& \.data-table__search-field \{[^}]*flex: 0 1 22\.5rem/);
  });

  it('renders no heading without title and subtitle; the bar is always there (it has the column menu)', async () => {
    const { container } = render(<Nav source={createSource()} rowKey="id" columns={columns} title="Users" />);
    await loaded();

    expect(container.querySelector('.data-table__toolbar-heading')).not.toBeNull();
    expect(container.querySelector('.data-table__toolbar-bar')).not.toBeNull();

    cleanup();

    const searchOnly = render(<Nav source={createSource()} rowKey="id" columns={columns} searchable />);
    await loaded();

    expect(searchOnly.container.querySelector('.data-table__toolbar-heading')).toBeNull();
    expect(searchOnly.container.querySelector('.data-table__toolbar-bar')).not.toBeNull();
  });

  it('replaces the bar with the selection bar while rows are selected, in the same place', async () => {
    const { container } = render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[add, remove]} />);
    await loaded();

    const buttons = () =>
      [...container.querySelector('.data-table__toolbar-bar')!.querySelectorAll('button')].map((button) =>
        button.getAttribute('aria-label') ?? button.textContent
      ).filter((name) => name !== 'Columns');
    const selectTwo = () => {
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
      fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);
    };

    expect(buttons()).toEqual(['Add']);

    selectTwo();

    // the count in a pill with a × (the whole pill is the button that clears the selection; the pill is not in the
    // footer anymore), the actions on the selection, and an icon-only "deselect" button (a ghost button after a divider: the same as the
    // pill, at the right, where the pointer is after the actions)
    const bar = container.querySelector('.data-table__toolbar-bar')!;

    expect(bar.getAttribute('data-mode')).toBe('selection');
    expect(bar.querySelector('.data-table__pill')?.textContent).toBe('2 selected');
    expect(container.querySelector('.data-table__footer .data-table__pill')).toBeNull();
    expect(buttons()).toEqual(['Clear selection', 'Remove', 'Clear selection']);
    expect(screen.getAllByRole('button', { name: 'Clear selection' })[1]!.getAttribute('data-placement')).toBe('tool');
    expect(screen.getByRole('status').textContent).toBe('2 selected');

    clearSelectionWith('pill');

    expect(container.querySelector('.data-table__toolbar-bar')!.hasAttribute('data-mode')).toBe(false);
    expect(buttons()).toEqual(['Add']);

    selectTwo();
    clearSelectionWith('close');

    expect(buttons()).toEqual(['Add']);
  });

  it('puts pinned actions at the very start of the bar, and keeps them in the selection bar', async () => {
    const up = { type: 'general', key: 'up', label: 'Up', pinned: true, onClick: vi.fn() } as const;
    const { container } = render(
      <Nav source={createSource()} rowKey="id" columns={columns} searchable reloadable actions={[add, up, remove]} />,
    );
    await loaded();

    // The groups of the bar (fieldsets without a box) count by their content.
    const parts = () =>
      [...container.querySelector('.data-table__toolbar-bar')!.children].flatMap((part) =>
        part.classList.contains('data-table__toolbar-group') ? [...part.children] : [part]
      );

    expect(parts()[0]!.className).toBe('data-table__toolbar-pinned data-table__toolbar-actions');
    expect(parts()[0]!.textContent).toBe('Up');
    // a divider between them and Reload; ghost buttons like the view controls
    expect(parts()[1]!.className).toBe('data-table__toolbar-divider');
    expect(parts()[2]!.className).toBe('data-table__toolbar-reload');
    expect(screen.getByRole('button', { name: 'Up' }).getAttribute('data-placement')).toBe('tool');
    // not among the other general actions on the right
    expect(screen.getAllByRole('button', { name: 'Up' })).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Add' }).closest('.data-table__toolbar-pinned')).toBeNull();

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select row' })[0]!);

    // the selection bar: still first, before the pill; the other general actions are gone
    const bar = container.querySelector('.data-table__toolbar-bar')!;

    expect(bar.getAttribute('data-mode')).toBe('selection');
    expect(bar.firstElementChild!.className).toBe('data-table__toolbar-pinned data-table__toolbar-actions');
    expect(bar.children[1]!.className).toBe('data-table__toolbar-divider');
    expect(screen.queryByRole('button', { name: 'Add' })).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Up' }));

    expect(up.onClick).toHaveBeenCalledTimes(1);
  });

  it('shows a pinned action with a primary or danger variant filled, and has no divider when nothing follows it', async () => {
    const up = { type: 'general', key: 'up', label: 'Up', pinned: true, onClick: () => {} } as const;
    const wipe = {
      type: 'general',
      key: 'wipe',
      label: 'Wipe',
      pinned: true,
      variant: 'danger',
      onClick: () => {},
    } as const;
    const { container } = render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[up, wipe]} />);
    await loaded();

    expect(screen.getByRole('button', { name: 'Up' }).getAttribute('data-placement')).toBe('tool');
    expect(screen.getByRole('button', { name: 'Wipe' }).getAttribute('data-placement')).toBe('toolbar');
    expect(screen.getByRole('button', { name: 'Wipe' }).getAttribute('data-variant')).toBe('danger');
    expect(container.querySelector('.data-table__toolbar-pinned')!.nextElementSibling).toBeNull();
  });

  it('ignores pinned inside a menu (the action stays in its menu)', async () => {
    const menu = {
      type: 'menu',
      key: 'more',
      label: 'More',
      actions: [{ type: 'general', key: 'up', label: 'Up', pinned: true, onClick: () => {} }],
    } as const;
    const { container } = render(<Nav source={createSource()} rowKey="id" columns={columns} actions={[menu]} />);
    await loaded();

    expect(container.querySelector('.data-table__toolbar-pinned')).toBeNull();
    expect(screen.getByRole('button', { name: 'More' })).toBeTruthy();
  });

  it('has the standard buttons for the actions of the toolbar, ghost buttons for its view controls, link-like ones in the rows', async () => {
    const button = rulesOf('data-table__button');

    // actions: primary and danger filled (secondary outlined, the base look)
    expect(button).toMatch(
      /&\[data-placement='toolbar'\]\[data-variant='primary'\] \{[^}]*background-color: var\(--param-color-primary\)/,
    );
    expect(button).toMatch(
      /&\[data-placement='toolbar'\]\[data-variant='danger'\] \{[^}]*background-color: var\(--param-color-danger\);[^}]*color: var\(--param-color-on-primary\)/,
    );
    // view controls: ghost
    expect(button).toMatch(
      /&\[data-placement='tool'\] \{[^}]*border-color: transparent;[^}]*background-color: transparent/,
    );
    expect(button).toMatch(/&\[data-placement='row'\] \{[^}]*background-color: transparent/);

    render(<Nav source={createSource()} rowKey="id" columns={columns} reloadable actions={[add]} />);
    await loaded();

    expect(screen.getByRole('button', { name: 'Add' }).getAttribute('data-placement')).toBe('toolbar');
    expect(screen.getByRole('button', { name: 'Reload' }).getAttribute('data-placement')).toBe('tool');
  });
});

describe('column toggle menu', () => {
  const headers = () => screen.getAllByRole('columnheader').map((header) => header.textContent).filter(Boolean);
  const item = (name: string) => screen.getByRole('menuitemcheckbox', { name });

  it('is always there, with only its actions when no column is hideable', async () => {
    render(<Nav source={createSource()} rowKey="id" columns={columns} />);
    await loaded();

    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));

    expect(await screen.findByRole('menuitem', { name: 'Reset column widths' })).toBeTruthy();
    expect(screen.queryAllByRole('menuitemcheckbox')).toEqual([]);
  });

  it('fixes the control columns at the start and the action column at the end, with offsets', async () => {
    const widthOf = (element: HTMLElement) =>
      element.hasAttribute('data-select') ? 40 : element.getAttribute('data-sticky') === 'start' ? 30 : 0;
    const original = HTMLElement.prototype.getBoundingClientRect;
    const measured = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function(this: HTMLElement) {
        return { ...original.call(this), width: widthOf(this) } as DOMRect;
      },
    );

    try {
      renderNav({
        selection: 'multi',
        actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: vi.fn() }],
      });
      await loaded();

      const header = screen.getAllByRole('row')[0]!;
      const start = [...header.querySelectorAll<HTMLElement>('[data-sticky="start"]')];

      // one control column here: the selection
      expect(start).toHaveLength(1);
      expect(start[0]!.hasAttribute('data-sticky-edge')).toBe(true);
      expect(start[0]!.style.insetInlineStart).toBe('0px');
      expect(header.querySelectorAll('[data-sticky="end"]')).toHaveLength(1);

      // every row has them too
      const row = screen.getAllByRole('row')[1]!;

      expect(row.querySelectorAll('[data-sticky="start"]')).toHaveLength(1);
      expect(row.querySelectorAll('[data-sticky="end"]')).toHaveLength(1);
      expect(row.querySelector('[data-sticky="start"]')!.hasAttribute('data-select')).toBe(true);
      // the data cells are not fixed
      expect(row.querySelectorAll('[data-sticky]')).toHaveLength(2);
    } finally {
      measured.mockRestore();
    }
  });

  it('optimizes the column widths: the width each column needs, within the limits', async () => {
    const widthOf: Record<string, number> = { Name: 150, City: 900 };
    const original = HTMLElement.prototype.getBoundingClientRect;
    const measured = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      function(this: HTMLElement) {
        const text = this.getAttribute('role') === 'columnheader' ? this.textContent ?? '' : '';

        return { ...original.call(this), width: widthOf[text.trim()] ?? 0 } as DOMRect;
      },
    );

    try {
      render(<Nav source={createSource()} rowKey="id" columns={columns} />);
      await loaded();

      const table = screen.getByRole('table');

      fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
      fireEvent.click(await screen.findByRole('menuitem', { name: 'Optimize column widths' }));

      // the table is back to its template, with the measured widths (City: capped) as minimums that grow to fill the view
      expect(table.style.gridTemplateColumns).toBe('minmax(150px, 150fr) minmax(480px, 480fr)');
    } finally {
      measured.mockRestore();
    }
  });

  it('resets the column widths, only enabled after a resize', async () => {
    const measured = mockHeaderWidths({ Name: 100, City: 300 });

    render(<Nav source={createSource()} rowKey="id" columns={columns} />);
    await loaded();

    const table = screen.getByRole('table');
    const handle = screen.getByRole('columnheader', { name: /Name/ }).querySelector<HTMLElement>(
      '.data-table__resizer',
    )!;

    handle.setPointerCapture = vi.fn();
    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    expect((await screen.findByRole('menuitem', { name: 'Reset column widths' })).getAttribute('aria-disabled')).toBe(
      'true',
    );

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 200 });
    fireEvent.pointerUp(handle, { pointerId: 1 });
    expect(table.style.gridTemplateColumns).toBe('300px 300px');

    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Reset column widths' }));

    expect(table.style.gridTemplateColumns).toBe('minmax(0, 1fr) minmax(0, 1fr)');
    measured.mockRestore();
  });

  it('shows and hides the hideable columns, starts with `hidden`, and never hides the last shown column', async () => {
    const toggled: readonly Spec.Column<Person>[] = [
      { key: 'name', header: 'Name' },
      { key: 'city', header: 'City', hideable: true },
      { key: 'id', header: 'Id', hideable: true, hidden: true },
    ];

    render(<Nav source={createSource()} rowKey="id" columns={toggled} />);
    await loaded();

    expect(headers()).toEqual(['Name', 'City']);

    click('Columns');

    // only the hideable columns, with their state; the menu stays open while toggling
    expect(await screen.findAllByRole('menuitemcheckbox')).toHaveLength(2);
    expect(item('City').getAttribute('aria-checked')).toBe('true');
    expect(item('Id').getAttribute('aria-checked')).toBe('false');

    fireEvent.click(item('Id'));
    await waitFor(() => expect(headers()).toEqual(['Name', 'City', 'Id']));

    fireEvent.click(item('City'));
    await waitFor(() => expect(headers()).toEqual(['Name', 'Id']));
    expect(screen.getByRole('menu')).toBeTruthy();
  });

  it('keeps the last shown column: its item is disabled', async () => {
    const toggled: readonly Spec.Column<Person>[] = [
      { key: 'name', header: 'Name', hideable: true },
      { key: 'city', header: 'City', hideable: true, hidden: true },
    ];

    render(<Nav source={createSource()} rowKey="id" columns={toggled} />);
    await loaded();

    click('Columns');

    expect((await screen.findByRole('menuitemcheckbox', { name: 'Name' })).hasAttribute('data-disabled')).toBe(true);
  });
});

describe('selection controls', () => {
  it('draws checkboxes and radios itself: a checked one shows its border and tick in the check color, no fill', () => {
    const check = baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__check {'));

    expect(check).toMatch(/^[^}]*appearance: none;/);
    // the box keeps the surface color when checked: only the border and the tick take the check color
    expect(check).toMatch(/&:checked,\s*&:indeterminate \{\s*border-color: currentColor;\s*\}/);
    expect(check).toMatch(/&::before \{[^}]*background-color: currentColor;[^}]*mask:/);
    expect(check).not.toMatch(/&:checked \{[^}]*background-color/);
  });

  it('makes the selection checkboxes and radios gray with the neutral appearance, and only those', () => {
    expect(baseStylesheet).toMatch(
      /:where\(\[data-selection-appearance='neutral'\]\) :is\(\.data-table__data-row > \.data-table__cell > \.data-table__check, \.data-table__group-row > \.data-table__cell > \.data-table__check, \.data-table__header-tall > \.data-table__check, \.data-table__card-select > \.data-table__check, \.data-table__card-group > \.data-table__check\) \{\s*color: var\(--param-color-text-dimmed\);/,
    );
    expect(baseStylesheet).toMatch(/\n\.data-table__check \{[^}]*color: var\(--param-color-primary\);/);
  });
});

describe('cell text', () => {
  it('hyphenates long words and breaks a word only when it does not fit on a line at all', () => {
    const cell = baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__cell {'));

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
    expect(name.classList.contains('data-table__cell-text')).toBe(true);
    expect(name.parentElement?.hasAttribute('data-wrap')).toBe(false);
    expect(city.parentElement?.hasAttribute('data-wrap')).toBe(true);

    const text = baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__cell-text {'));

    expect(text).toMatch(/^[^}]*overflow: hidden;[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/);
    expect(text).toMatch(
      /:where\(\.data-table__cell\[data-wrap\], \.data-table__detail-cell\) > & \{\s*overflow: visible;\s*white-space: normal;/,
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
    expect(screen.getByText('Person 01').classList.contains('data-table__cell-text')).toBe(false);
  });
});

describe('accent hover', () => {
  it('tints hovered rows with the accent hover color in accent mode, after the gray hovers', () => {
    const hover = baseStylesheet.slice(baseStylesheet.lastIndexOf('\n@media (hover: hover)'));
    const accent = hover.indexOf(
      '[data-selection-appearance=\'accent\']) .data-table__data-row:hover > .data-table__cell',
    );

    expect(accent).toBeGreaterThan(hover.indexOf('var(--param-color-surface-strong)'));
    expect(hover.slice(accent)).toMatch(/^[^}]*background-color: var\(--param-color-hover-accent\);/);
  });
});

describe('text selection', () => {
  it('lets no text be selected in the toolbar, the header, the group bands, the footer, the filter view and its drawer, except in text inputs', () => {
    expect(baseStylesheet).toMatch(
      /\.data-table__toolbar,\s*\.data-table__header-row,\s*\.data-table__group-row,\s*\.data-table__footer,\s*\.data-table__filter-view,\s*\.data-table__filter-sidebar \{\s*user-select: none;\s*& :is\(input, textarea\) \{\s*user-select: text;/,
    );
    // the rows stay selectable
    expect(baseStylesheet).not.toMatch(/\.(row|dataRow|cell) \{[^}]*user-select: none/);
  });

  it('lets text be selected in one cell at a time: the one where the mouse went down', () => {
    expect(baseStylesheet).toMatch(/\.data-table__table \{[^}]*user-select: none;/);
    expect(baseStylesheet).toMatch(/\.data-table__cell:is\(\[data-selecting\][^{]*\{\s*user-select: text;/);
  });
});

describe('the line at the bottom of the rows', () => {
  it('lays it over the bottom edge of the rows area, in the row lines\' color', () => {
    const line = baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__scroll-area::after {'));

    expect(line).toMatch(/^[^}]*bottom: 0;[^}]*height: 1px;[^}]*background-color: var\(--param-color-divider\);/);
  });

  it('adds nothing to scroll: no border of the scroller, no negative margin of the table', () => {
    const scroller = baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__scroller {'));

    expect(scroller).not.toMatch(/^[^}]*border-bottom/);
    expect(baseStylesheet).not.toContain('margin-bottom: -1px');
  });

  it('leaves it out below the empty state and below cards', () => {
    expect(baseStylesheet).toMatch(
      /\.data-table__scroll-area:has\(\.data-table__empty-cell\)::after,\s*:where\(\[data-cards\]\) \.data-table__scroll-area::after \{\s*display: none;/,
    );
  });

  it('takes the plain line of the last row, before the hover rules', () => {
    const rule =
      '.data-table__table > :last-child > .data-table__cell:not([data-selected]) {\n  border-bottom-color: transparent;';
    expect(baseStylesheet).toContain(rule);
    expect(baseStylesheet.indexOf(rule)).toBeLessThan(
      baseStylesheet.indexOf('.data-table__data-row:hover > .data-table__cell'),
    );
  });
});

describe('vertical dividers', () => {
  it('draws the one before the action column in the light divider color, none after the meta columns', () => {
    expect(baseStylesheet).not.toContain('data-divider=\'end\'');
    expect(baseStylesheet).toMatch(
      /&\[data-divider='start'\] \{\s*border-inline-start: 1px solid var\(--param-color-divider\);/,
    );
  });

  it('hides it on selected and hovered rows, by color only', () => {
    expect(baseStylesheet).toMatch(
      /\.data-table__cell\[data-selected\]\[data-divider='start'\] \{\s*border-inline-start-color: transparent;/,
    );

    const hover = baseStylesheet.slice(baseStylesheet.lastIndexOf('\n@media (hover: hover)'));

    expect(hover).toMatch(
      /\.data-table__detail-row:hover > \.data-table__cell\[data-divider='start'\],[^{]*\{\s*border-inline-start-color: transparent;/,
    );
  });
});

describe('sortable header hover', () => {
  it('draws a rounded shape inside the cell on hover, behind the text', () => {
    const header = baseStylesheet.slice(baseStylesheet.indexOf('\n.data-table__header {'));

    expect(header).toMatch(
      /&::before \{[^}]*inset: 3px 5px;[^}]*z-index: -1;[^}]*border-radius: var\(--param-radius\);/,
    );
    expect(header).toMatch(
      /&\[data-sortable\]:hover::before \{\s*background-color: var\(--param-color-surface-strong\);/,
    );
    // no shape while the resize line is there
    expect(header).toMatch(
      /&\[data-sortable\]:has\(\.data-table__resizer:hover, \.data-table__resizer\[data-dragging\]\)::before \{\s*background-color: transparent;/,
    );
  });
});

describe('group header gap', () => {
  it('has a transparent gap above every group header, inside the cell (so the drag measures it), and no band', () => {
    expect(baseStylesheet).toMatch(
      /\.data-table__group-row > \.data-table__group-cell \{\s*border-top: var\(--param-spacing-sm\) solid transparent;\s*\}/,
    );
    expect(baseStylesheet).toMatch(
      /\.data-table__group-cell \{\s*font-weight: var\(--param-font-weight-bold\);\s*\}/,
    );
  });
});

describe('row hover', () => {
  it('draws a line on top and at the bottom of a hovered row, without moving it, and none on top of the first', () => {
    const hover = baseStylesheet.slice(baseStylesheet.lastIndexOf('\n@media (hover: hover)'));

    expect(hover).toMatch(
      /\.data-table__data-row:hover > \.data-table__cell:not\(\[data-selected\]\),\s*\.data-table__data-row:has\(\+ \.data-table__detail-row:hover\) > \.data-table__cell:not\(\[data-selected\]\) \{\s*margin-top: -1px;\s*border-top: 1px solid var\(--param-color-border\);/,
    );
    expect(hover).toMatch(
      /\.data-table__detail-row:hover > \.data-table__cell:not\(\[data-selected\]\) \{\s*border-bottom-color: var\(--param-color-border\);/,
    );
    expect(hover).toMatch(
      /\.data-table__header-row \+ \.data-table__data-row:hover > \.data-table__cell:not\(\[data-selected\]\),[^{]*\{\s*margin-top: 0;\s*border-top: none;/,
    );
  });
});

describe('controller', () => {
  // A table with a controller, and buttons outside of it that use the controller, like an app would.
  function Controlled(props: { source: Spec.Source<Person> }): ReactElement {
    const nav = useDataTableController<Person>();
    const selected = useDataTableSelection(nav);

    return (
      <>
        <Nav
          controller={nav}
          source={props.source}
          rowKey="id"
          columns={columns}
          pageSize={10}
          actions={[{ type: 'multiRow', key: 'remove', label: 'Remove', onClick: () => {} }]}
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
    click('Page 6');
    await loaded();

    total = 25;
    click('Reload from outside');

    await waitFor(() => expect(source.mock.lastCall?.[0].page).toBe(3));
    await loaded();

    expect(screen.getByText('21-25 of 25')).toBeTruthy();
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

describe('row reordering', () => {
  // The keys of the data rows, in the order shown.
  const order = () =>
    [...document.querySelectorAll('[role="row"][data-row-key]')].map((row) => row.getAttribute('data-row-key'));
  const handles = () => screen.getAllByRole('button', { name: 'Move row', hidden: true });

  it('has no drag handles without reorder', async () => {
    renderNav();
    await loaded();

    expect(screen.queryAllByRole('button', { name: 'Move row', hidden: true })).toHaveLength(0);
  });

  it('shows a handle in every row, and ignores sortable columns and the default sort', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { source } = renderNav({ reorder: vi.fn(), defaultSort: { key: 'name', direction: 'desc' } });

    await loaded();

    expect(handles()).toHaveLength(10);
    expect(source.mock.calls[0]?.[0].sort).toBeUndefined();
    expect(screen.getByRole('columnheader', { name: 'Name' }).hasAttribute('aria-sort')).toBe(false);
    warn.mockRestore();
  });

  it('moves a row with Alt+ArrowDown and Alt+ArrowUp, and saves each move with its neighbors', async () => {
    const reorder = vi.fn();

    renderNav({ reorder });
    await loaded();

    fireEvent.keyDown(handles()[0]!, { key: 'ArrowDown', altKey: true });

    expect(order().slice(0, 3)).toEqual(['2', '1', '3']);
    expect(screen.getAllByRole('status').map((status) => status.textContent)).toContain('Moved to position 2');
    await waitFor(() => expect(reorder).toHaveBeenCalledTimes(1));
    expect(reorder).toHaveBeenCalledWith({ row: people[0], after: people[1], before: people[2] });

    // Without Alt, the arrows do nothing; the first row cannot go further up.
    fireEvent.keyDown(handles()[1]!, { key: 'ArrowUp' });
    fireEvent.keyDown(handles()[0]!, { key: 'ArrowUp', altKey: true });

    expect(order().slice(0, 3)).toEqual(['2', '1', '3']);

    fireEvent.keyDown(handles()[1]!, { key: 'ArrowUp', altKey: true });

    expect(order().slice(0, 3)).toEqual(['1', '2', '3']);
    await waitFor(() => expect(reorder).toHaveBeenCalledTimes(2));
    expect(reorder).toHaveBeenLastCalledWith({ row: people[0], after: undefined, before: people[1] });
  });

  it('moves a row by dragging its handle, and not when the drag is cancelled with Escape', async () => {
    const reorder = vi.fn();

    renderNav({ reorder });
    await loaded();

    // jsdom has no layout: every row is at 0, so any point below it is after all the others.
    fireEvent.pointerDown(handles()[0]!, { button: 0, pointerId: 1 });
    fireEvent.pointerMove(handles()[0]!, { pointerId: 1, clientY: 100 });
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.pointerUp(handles()[0]!, { pointerId: 1 });

    expect(order()[0]).toBe('1');

    const handle = handles()[0]!;

    fireEvent.pointerDown(handle, { button: 0, pointerId: 1 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientY: 100 });

    // The dragged row follows the pointer, and the rows it passes go up to make room (nothing moves in the DOM yet).
    const lookOf = (key: string) =>
      document.querySelector(`[role="row"][data-row-key="${key}"] > [role="cell"]`)?.getAttribute('data-drag');

    expect(lookOf('1')).toBe('dragged');
    expect(lookOf('2')).toBe('up');
    expect(lookOf('10')).toBe('up');
    expect(order()[0]).toBe('1');

    fireEvent.pointerUp(handle, { pointerId: 1 });

    expect(order()[9]).toBe('1');
    await waitFor(() => expect(reorder).toHaveBeenCalledWith({ row: people[0], after: people[9], before: undefined }));
  });

  it('loads the page again when a save fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reorder = vi.fn(() => Promise.reject(new Error('refused')));
    const { source } = renderNav({ reorder });

    await loaded();
    fireEvent.keyDown(handles()[0]!, { key: 'ArrowDown', altKey: true });

    expect(order()[0]).toBe('2');
    await waitFor(() => expect(source).toHaveBeenCalledTimes(2));
    await loaded();
    expect(order()[0]).toBe('1');
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('hides the handles (keeping their room) while a search is active', async () => {
    const reorder = vi.fn();

    renderNav({ reorder, searchable: true });
    await loaded();

    fireEvent.change(screen.getByRole('textbox', { name: 'Search' }), { target: { value: 'Vienna' } });
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Search' }), { key: 'Enter' });
    await loaded();

    expect(handles().every((handle) => handle.hasAttribute('data-inactive') && handle.hasAttribute('inert'))).toBe(
      true,
    );

    fireEvent.keyDown(handles()[0]!, { key: 'ArrowDown', altKey: true });

    expect(reorder).not.toHaveBeenCalled();
  });
});

describe('row grouping', () => {
  // People 1–15 are in group A, the others in group B: page 1 (10 rows) is all A, page 2 has 5 of A and 5 of B.
  const groupOf = (person: Person) => (person.id <= 15 ? 'A' : 'B');
  const groupRows = () =>
    [...document.querySelectorAll('[role="row"]')].filter((row) =>
      row.querySelector('[aria-expanded]') !== null && !row.hasAttribute('data-row-key')
    );
  const dataRows = () => document.querySelectorAll('[role="row"][data-row-key]');

  // The source with the totals of the groups on the page.
  function withTotals(source: ReturnType<typeof createSource>): Spec.Source<Person> {
    return async (query) => {
      const result = await source(query);
      const keys = [...new Set(result.rows.map(groupOf))];

      return {
        ...result,
        groups: keys.map((key) => ({ key, total: people.filter((p) => groupOf(p) === key).length })),
      };
    };
  }

  it('never makes the text of a group header selectable, where a data cell becomes selectable', async () => {
    renderNav({ groupBy: groupOf });
    await loaded();

    const header = groupRows()[0]!.querySelector<HTMLElement>('[role="cell"]')!;
    const cell = screen.getByText('Person 01').closest<HTMLElement>('[role="cell"]')!;

    fireEvent.pointerDown(cell);
    expect(cell.hasAttribute('data-selecting')).toBe(true);

    fireEvent.pointerDown(header);
    expect(header.hasAttribute('data-selecting')).toBe(false);
    // the mark left the data cell too: nothing is selectable now
    expect(cell.hasAttribute('data-selecting')).toBe(false);
  });

  it('puts a header before every group of the page, with the number of its rows', async () => {
    renderNav({ groupBy: groupOf });
    await loaded();

    expect(groupRows().map((row) => row.textContent)).toEqual(['A10']);

    click('Next page');
    await loaded();

    expect(groupRows().map((row) => row.textContent)).toEqual(['A5', 'B5']);
  });

  it('shows the part of a group that is on the page, with the totals of the source', async () => {
    renderNav({ groupBy: groupOf, source: withTotals(createSource()) });
    await loaded();

    expect(groupRows().map((row) => row.textContent)).toEqual(['A10 of 15']);

    click('Next page');
    await loaded();

    expect(groupRows().map((row) => row.textContent)).toEqual(['A5 of 15', 'B5 of 45']);
  });

  it('groups by a column key too, and renders a custom group header', async () => {
    renderNav({ groupBy: 'city', renderGroup: (group) => `City ${group.key}: ${group.rows.length}` });
    await loaded();

    // The cities alternate, so every row is a group of its own.
    expect(groupRows()[0]?.textContent).toBe('City Vienna: 1');
    expect(groupRows()).toHaveLength(10);
  });

  it('collapses and expands a group without a new load, and keeps it collapsed on the next page', async () => {
    const { source } = renderNav({ groupBy: groupOf });

    await loaded();
    const calls = source.mock.calls.length;
    const toggle = within(groupRows()[0] as HTMLElement).getByRole('button');

    fireEvent.click(toggle);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(dataRows()).toHaveLength(0);
    expect(source.mock.calls.length).toBe(calls);

    click('Next page');
    await loaded();

    // A is still collapsed, B is not.
    expect(dataRows()).toHaveLength(5);
    expect(screen.getByText('Person 16')).toBeTruthy();
    expect(screen.queryByText('Person 11')).toBeNull();
  });

  it('has no checkbox in the group headers by default (opt-in: selectableGroups)', async () => {
    renderNav({ groupBy: groupOf, selection: 'multi' });
    await loaded();

    expect(screen.queryAllByRole('checkbox', { name: 'Select group' })).toHaveLength(0);
    // The rows keep theirs.
    expect(screen.getAllByRole('checkbox', { name: 'Select row' }).length).toBeGreaterThan(0);
    // The header's content starts in the first column (no empty cell of the selection column before it).
    const cells = document.querySelector('[data-group-key]')!.querySelectorAll<HTMLElement>('[role="cell"]');

    expect(cells).toHaveLength(1);
    expect(cells[0]!.style.gridColumn).toMatch(/^1 \//);
  });

  it('selects and deselects the rows of a group with its checkbox', async () => {
    renderNav({ groupBy: groupOf, selection: 'multi', selectableGroups: true });
    await loaded();
    click('Next page');
    await loaded();

    fireEvent.click(screen.getAllByRole('checkbox', { name: 'Select group' })[1]!);

    expect(screen.getByText('5 selected')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Deselect group' })).toBeTruthy();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Deselect group' }));

    expect(screen.queryByText('5 selected')).toBeNull();
  });

  describe('group actions', () => {
    const groupActions = (calls: string[]): readonly Spec.Action<Person>[] => [
      {
        type: 'group',
        key: 'rename',
        icon: <svg />,
        tip: 'Rename group',
        onClick: (group) => calls.push(`rename ${group.key} ${group.rows.length}`),
      },
      {
        type: 'group',
        key: 'hidden',
        label: 'Only here',
        contextMenu: false,
        onClick: (group) => calls.push(`only ${group.key}`),
      },
      { type: 'singleRow', key: 'edit', label: 'Edit', onClick: (row) => calls.push(`edit ${row.id}`) },
    ];

    it('shows the group actions at the end of every group header, and runs them with the group', async () => {
      const calls: string[] = [];

      renderNav({ groupBy: groupOf, actions: groupActions(calls) });
      await loaded();
      click('Next page');
      await loaded();

      const [a, b] = groupRows() as HTMLElement[];

      fireEvent.click(within(b!).getByRole('button', { name: 'Rename group' }));
      fireEvent.click(within(a!).getByRole('button', { name: 'Only here' }));

      expect(calls).toEqual(['rename B 5', 'only A']);
      // Not in the rows: a row has only its row actions.
      expect(within(dataRows()[0] as HTMLElement).queryByRole('button', { name: 'Rename group' })).toBeNull();
    });

    it('opens the context menu of a group header with its group actions', async () => {
      const calls: string[] = [];

      renderNav({ groupBy: groupOf, actions: groupActions(calls) });
      await loaded();

      fireEvent.contextMenu(within(groupRows()[0] as HTMLElement).getAllByRole('button')[0]!);
      await screen.findByRole('menu');

      // `contextMenu: false` leaves one out.
      expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Rename group']);
      fireEvent.click(screen.getByRole('menuitem', { name: 'Rename group' }));
      expect(calls).toEqual(['rename A 10']);
    });

    it('has no group actions in the context menu of a row', async () => {
      renderNav({ groupBy: groupOf, actions: groupActions([]) });
      await loaded();

      fireEvent.contextMenu(screen.getByText('Person 03'));
      await screen.findByRole('menu');

      expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['Edit']);
    });
  });

  describe('with reorder', () => {
    // Persons 1 and 2 are in A, 3 in B, 4 has an empty group (the blank group).
    const sectionOf = (person: Person) => ({ 1: 'A', 2: 'A', 3: 'B' })[person.id] ?? '';
    const source = async (): Promise<Spec.Result<Person>> => ({
      rows: people.slice(0, 4),
      total: 4,
      groups: [{ key: 'A', total: 2 }, { key: 'B', total: 1 }, { key: '', total: 1 }],
    });
    // The rows area line by line: a group header as its text, a row as its key.
    const lines = () =>
      [...document.querySelectorAll('[role="row"][data-line]:not([class*="detail"])')].map((row) =>
        row.getAttribute('data-row-key') ?? row.textContent
      );
    const handleOf = (id: number) =>
      within(document.querySelector(`[data-row-key="${id}"]`) as HTMLElement).getByRole('button', {
        name: 'Move row',
        hidden: true,
      });
    const press = (id: number, key: string) => fireEvent.keyDown(handleOf(id), { key, altKey: true });

    it('fills the handle column of a group header with a checkbox, so its band spans the whole width', async () => {
      renderNav({ groupBy: sectionOf, reorder: vi.fn(), source, selection: 'multi', selectableGroups: true });
      await loaded();

      const cells = [...(groupRows()[0]?.children ?? [])] as HTMLElement[];

      expect(cells.map((cell) => cell.style.gridColumn.split(' ')[0])).toEqual(['1', '2', '3']);
    });

    it('starts the content of a group header in the first column without a checkbox', async () => {
      renderNav({ groupBy: sectionOf, reorder: vi.fn(), source, selection: 'multi' });
      await loaded();

      const cells = [...(groupRows()[0]?.children ?? [])] as HTMLElement[];

      expect(cells.map((cell) => cell.style.gridColumn.split(' ')[0])).toEqual(['1']);
    });

    it('shows the blank group like any other group', async () => {
      renderNav({ groupBy: sectionOf, reorder: vi.fn(), source });
      await loaded();

      expect(lines()).toEqual(['A2', '1', '2', 'B1', '3', '(Blank)1', '4']);
    });

    it('moves rows into other groups with the keyboard, and saves the group', async () => {
      const reorder = vi.fn();

      renderNav({ groupBy: sectionOf, reorder, source });
      await loaded();

      // Down from the last row of A: past the header of B, to its start.
      press(2, 'ArrowDown');
      expect(lines()).toEqual(['A1', '1', 'B2', '2', '3', '(Blank)1', '4']);
      await waitFor(() => expect(reorder).toHaveBeenCalledTimes(1));
      expect(reorder).toHaveBeenLastCalledWith({ row: people[1], group: 'B', after: people[0], before: people[2] });

      // Up from the only row of the blank group: to the end of B; the blank group stays, empty.
      press(4, 'ArrowUp');
      expect(lines()).toEqual(['A1', '1', 'B3', '2', '3', '4', '(Blank)0']);
      await waitFor(() => expect(reorder).toHaveBeenCalledTimes(2));
      expect(reorder).toHaveBeenLastCalledWith({ row: people[3], group: 'B', after: people[2], before: undefined });
    });

    it('shows the empty groups of the source, and moves a row into one', async () => {
      const reorder = vi.fn();
      // E has no rows: its header comes where `groups` puts it, between A and B.
      const withEmpty = async (): Promise<Spec.Result<Person>> => ({
        ...(await source()),
        groups: [{ key: 'A', total: 2 }, { key: 'E', total: 0 }, { key: 'B', total: 1 }, { key: '', total: 1 }],
      });

      renderNav({ groupBy: sectionOf, reorder, source: withEmpty, selection: 'multi', selectableGroups: true });
      await loaded();

      expect(lines()).toEqual(['A2', '1', '2', 'E0', 'B1', '3', '(Blank)1', '4']);
      // Nothing to select in it: no checkbox.
      expect(screen.getAllByRole('checkbox', { name: 'Select group' })).toHaveLength(3);

      // Down from the last row of A: into E.
      press(2, 'ArrowDown');
      expect(lines()).toEqual(['A1', '1', 'E1', '2', 'B1', '3', '(Blank)1', '4']);
      await waitFor(() => expect(reorder).toHaveBeenCalledTimes(1));
      expect(reorder).toHaveBeenLastCalledWith({ row: people[1], group: 'E', after: people[0], before: people[2] });
    });

    // The toggle (chevron) of a group header, by the start of its text.
    const toggleOf = (name: RegExp) => screen.getByRole('button', { name });

    it('collapses a group whose last row is moved out', async () => {
      renderNav({ groupBy: sectionOf, reorder: vi.fn(), source });
      await loaded();

      expect(toggleOf(/^\(Blank\)/).getAttribute('aria-expanded')).toBe('true');

      // Up from the only row of the blank group: it is empty now, and collapsed (nothing to show).
      press(4, 'ArrowUp');
      expect(lines()).toEqual(['A2', '1', '2', 'B2', '3', '4', '(Blank)0']);
      expect(toggleOf(/^\(Blank\)/).getAttribute('aria-expanded')).toBe('false');
      // A group that keeps rows stays as it is.
      expect(toggleOf(/^A/).getAttribute('aria-expanded')).toBe('true');
    });

    it('expands a collapsed empty group a row is moved into, and keeps a collapsed group with rows collapsed', async () => {
      const withEmpty = async (): Promise<Spec.Result<Person>> => ({
        ...(await source()),
        groups: [{ key: 'A', total: 2 }, { key: 'E', total: 0 }, { key: 'B', total: 1 }, { key: '', total: 1 }],
      });

      renderNav({ groupBy: sectionOf, reorder: vi.fn(), source: withEmpty });
      await loaded();

      fireEvent.click(toggleOf(/^E/));
      fireEvent.click(toggleOf(/^B/));
      expect(lines()).toEqual(['A2', '1', '2', 'E0', 'B1', '(Blank)1', '4']);

      // Down from the last row of A: into the collapsed, empty E, which opens (the row is all it has).
      press(2, 'ArrowDown');
      expect(lines()).toEqual(['A1', '1', 'E1', '2', 'B1', '(Blank)1', '4']);
      expect(toggleOf(/^E/).getAttribute('aria-expanded')).toBe('true');

      // Down again, into the collapsed B, which has a row: it stays closed (its count changes).
      press(2, 'ArrowDown');
      expect(lines()).toEqual(['A1', '1', 'E0', 'B2', '(Blank)1', '4']);
      expect(toggleOf(/^B/).getAttribute('aria-expanded')).toBe('false');
      // E is empty again, so it collapses.
      expect(toggleOf(/^E/).getAttribute('aria-expanded')).toBe('false');
    });
  });
});

describe('row editing', () => {
  const editColumns: readonly Spec.Column<Person>[] = [
    { key: 'name', header: 'Name', edit: textColumnEditor() },
    { key: 'city', header: 'City', edit: selectColumnEditor({ options: ['Vienna', 'Berlin'] }) },
  ];

  type EditableProps = {
    saveRow?: Spec.SaveRow<Person>;
    createRow?: Spec.CreateRow<Person>;
    columns?: readonly Spec.Column<Person>[];
    editFields?: readonly Spec.EditField<Person>[];
    source?: Spec.Source<Person>;
  };

  // A table whose "Edit" (a row action, the default one) opens the edit form through the controller, and whose "Add"
  // (a general action) a new row.
  function Editable(props: EditableProps): ReactElement {
    const nav = useDataTableController<Person>();

    return (
      <Nav
        controller={nav}
        source={props.source ?? createSource()}
        rowKey="id"
        columns={props.columns ?? editColumns}
        pageSize={10}
        searchable
        saveRow={props.saveRow}
        createRow={props.createRow}
        editFields={props.editFields}
        actions={[
          { type: 'general', key: 'add', label: 'Add', onClick: () => nav.addRow({ id: 0, name: '', city: 'Vienna' }) },
          { type: 'singleRow', key: 'edit', label: 'Edit', default: true, onClick: (row) => nav.editRow(row) },
        ]}
      />
    );
  }

  async function editFirstRow(saveRow: Spec.SaveRow<Person>): Promise<HTMLInputElement> {
    render(<Editable saveRow={saveRow} />);
    await loaded();
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]!);

    return screen.getByRole<HTMLInputElement>('textbox', { name: 'Name' });
  }

  const rowOf = (key: string) =>
    document.querySelector<HTMLElement>(`[role="row"][data-row-key="${key}"]:not([data-edit-form])`)!;
  const form = () => document.querySelector<HTMLElement>('[data-edit-form]')!;

  it('opens the form below the row, focuses its first editor, and blocks the rest of the table', async () => {
    const input = await editFirstRow(vi.fn());

    expect(input.value).toBe('Person 01');
    expect(document.activeElement).toBe(input);
    expect(within(form()).getByRole('group', { name: 'Edit row' })).toBeTruthy();
    expect(within(form()).getByRole('combobox', { name: 'City' }).textContent).toBe('Vienna');
    // Right after its row.
    expect(rowOf('1').nextElementSibling).toBe(form());
    expect(rowOf('1').hasAttribute('data-editing')).toBe(true);
    expect(rowOf('1').hasAttribute('data-blocked')).toBe(false);
    expect(rowOf('2').hasAttribute('inert')).toBe(true);
    expect(rowOf('2').hasAttribute('data-blocked')).toBe(true);
    expect(screen.getByPlaceholderText('Search').closest('[inert]')).not.toBeNull();
    expect(form().closest('[inert]')).toBeNull();
  });

  it('unfolds the form (and folds its row up, in the view), but only with motion', () => {
    expect(declarationsOf('.data-table__edit-form-cell')).toContain('transition: grid-template-rows 400ms');
    expect(baseStylesheet).toMatch(/@starting-style \{\s*\.data-table__edit-form-cell \{\s*grid-template-rows: 0fr;/);
  });

  it('has a field for a hidden column with an editor, and for the extra fields', async () => {
    render(
      <Editable
        saveRow={vi.fn()}
        columns={[
          { key: 'name', header: 'Name', edit: textColumnEditor() },
          { key: 'city', header: 'City', hideable: true, hidden: true, edit: textColumnEditor() },
        ]}
        editFields={[{ key: 'id', label: 'Number', edit: textColumnEditor() }]}
      />,
    );
    await loaded();
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]!);

    expect(within(form()).getAllByRole('textbox').map((input) => input.getAttribute('aria-labelledby'))).toHaveLength(
      3,
    );
    expect(within(form()).getByRole<HTMLInputElement>('textbox', { name: 'City' }).value).toBe('Vienna');
    expect(within(form()).getByRole<HTMLInputElement>('textbox', { name: 'Number' }).value).toBe('1');
  });

  it('saves the draft with "Save", and shows the saved row without a new load', async () => {
    const saveRow = vi.fn();
    const input = await editFirstRow(saveRow);

    fireEvent.change(input, { target: { value: 'Ada' } });
    await chooseIn(within(form()).getByRole('combobox', { name: 'City' }), 'Berlin');
    fireEvent.click(within(form()).getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(rowOf('1').hasAttribute('data-editing')).toBe(false));
    expect(saveRow).toHaveBeenCalledWith(people[0], { id: 1, name: 'Ada', city: 'Berlin' });
    expect(within(rowOf('1')).getByText('Ada')).toBeTruthy();
    expect(within(rowOf('1')).getByText('Berlin')).toBeTruthy();
    expect(rowOf('2').hasAttribute('inert')).toBe(false);
  });

  it('saves on Enter in a text input, and takes the row that saveRow returns', async () => {
    const saveRow = vi.fn(async (_row: Person, draft: Person) => ({ ...draft, name: draft.name.trim() }));
    const input = await editFirstRow(saveRow);

    fireEvent.change(input, { target: { value: '  Grace  ' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(within(rowOf('1')).getByText('Grace')).toBeTruthy());
    expect(saveRow).toHaveBeenCalledTimes(1);
  });

  it('cancels on Escape: the row is shown as it was, nothing is saved', async () => {
    const saveRow = vi.fn();
    const input = await editFirstRow(saveRow);

    fireEvent.change(input, { target: { value: 'Changed' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // First the form folds up (inert meanwhile), then it closes.
    expect(form().querySelector('[data-closing]')?.hasAttribute('inert')).toBe(true);

    await waitFor(() => expect(document.querySelector('[data-edit-form]')).toBeNull());
    expect(rowOf('1').hasAttribute('data-editing')).toBe(false);
    expect(within(rowOf('1')).getByText('Person 01')).toBeTruthy();
    expect(saveRow).not.toHaveBeenCalled();
    // The focus goes back to the "Edit" of the row.
    expect(document.activeElement).toBe(within(rowOf('1')).getByRole('button', { name: 'Edit' }));
  });

  it('cancels again when the same row is opened again right after', async () => {
    const input = await editFirstRow(vi.fn());

    fireEvent.keyDown(input, { key: 'Escape' });
    await waitFor(() => expect(document.querySelector('[data-edit-form]')).toBeNull());

    fireEvent.click(within(rowOf('1')).getByRole('button', { name: 'Edit' }));

    // Open, not folding up.
    expect(form().querySelector('[data-closing]')).toBeNull();

    fireEvent.click(within(form()).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(document.querySelector('[data-edit-form]')).toBeNull());
  });

  it('leaves edit mode without calling saveRow when nothing changed', async () => {
    const saveRow = vi.fn();

    await editFirstRow(saveRow);
    fireEvent.click(within(form()).getByRole('button', { name: 'OK' }));

    expect(rowOf('1').hasAttribute('data-editing')).toBe(false);
    expect(saveRow).not.toHaveBeenCalled();
  });

  it('stays in edit mode when the save fails, with the message of the error', async () => {
    const saveRow = vi.fn(async () => {
      throw new Error('The name is taken');
    });
    const input = await editFirstRow(saveRow);

    fireEvent.change(input, { target: { value: 'Ada' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect((await screen.findByRole('alert')).textContent).toBe('The name is taken');
    expect(rowOf('1').hasAttribute('data-editing')).toBe(true);
    expect(input.value).toBe('Ada');

    // A change takes the message away.
    fireEvent.change(input, { target: { value: 'Ada L.' } });

    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('says that the row could not be saved when the error has no message', async () => {
    const input = await editFirstRow(() => Promise.reject('nope'));

    fireEvent.change(input, { target: { value: 'Ada' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect((await screen.findByRole('alert')).textContent).toBe('The row could not be saved');
  });

  it('starts edit mode with the default action (a double click on a row)', async () => {
    render(<Editable saveRow={vi.fn()} />);
    await loaded();

    const cell = within(rowOf('3')).getAllByRole('cell')[0]!;

    fireEvent.click(cell, { detail: 1 });
    fireEvent.click(cell, { detail: 2 });
    fireEvent.doubleClick(cell);

    expect(within(form()).getByRole<HTMLInputElement>('textbox', { name: 'Name' }).value).toBe('Person 03');
    expect(rowOf('3').nextElementSibling).toBe(form());
  });

  it('edits a date with the date editor: one calendar, a click picks the day', async () => {
    type Dated = Person & { born: string };

    const saveRow = vi.fn();
    const dated: readonly Dated[] = [{ ...people[0]!, born: '1953-04-06' }];

    function WithDate(): ReactElement {
      const nav = useDataTableController<Dated>();

      return (
        <Nav
          controller={nav}
          source={async () => ({ rows: dated, total: 1 })}
          rowKey="id"
          columns={[{ key: 'name', header: 'Name' }, { key: 'born', header: 'Born', edit: dateColumnEditor() }]}
          saveRow={saveRow}
          actions={[{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: (row) => nav.editRow(row) }]}
        />
      );
    }

    render(<WithDate />);
    await loaded();
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));

    const trigger = within(form()).getByRole('button', { name: 'Born' });

    // In the medium format of the locale (en-US without an adapter).
    expect(trigger.textContent).toBe('Apr 6, 1953');

    fireEvent.click(trigger);

    const calendar = await waitFor(() => {
      const found = [...document.querySelectorAll<HTMLElement>('.datepicker')];

      expect(found).toHaveLength(1);

      return found[0]!.parentElement!;
    });

    expect(calendar.querySelector('.view-switch')?.textContent).toBe('April 1953');
    // Both buttons of the single calendar are named (none is hidden as an inner one).
    expect(within(calendar).getByRole('button', { name: 'Previous' })).toBeTruthy();

    fireEvent.click(calendar.querySelectorAll<HTMLElement>('.datepicker-cell.day:not(.prev):not(.next)')[19]!);

    await waitFor(() => expect(document.querySelector('.datepicker')).toBeNull());
    expect(trigger.textContent).toBe('Apr 20, 1953');

    fireEvent.click(within(form()).getByRole('button', { name: 'OK' }));

    await waitFor(() => expect(saveRow).toHaveBeenCalledWith(dated[0], { ...dated[0], born: '1953-04-20' }));
  });

  describe('a new row', () => {
    it('comes first, with its form, and is created with createRow', async () => {
      const createRow = vi.fn(async (draft: Person) => ({ ...draft, id: 99 }));

      render(<Editable createRow={createRow} />);
      await loaded();
      click('Add');

      expect(within(form()).getByRole('group', { name: 'New row' })).toBeTruthy();
      // "Add" instead of the "OK" of an edited row.
      expect(within(form()).getByRole('button', { name: 'Add' })).toBeTruthy();
      expect(within(form()).queryByRole('button', { name: 'OK' })).toBeNull();

      const input = within(form()).getByRole<HTMLInputElement>('textbox', { name: 'Name' });

      expect(document.activeElement).toBe(input);
      // The new row and its form come before the first row of the page.
      expect(rowOf('1').previousElementSibling).toBe(form());

      fireEvent.change(input, { target: { value: 'Newcomer' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      await waitFor(() => expect(document.querySelector('[data-edit-form]')).toBeNull());
      expect(createRow).toHaveBeenCalledWith({ id: 0, name: 'Newcomer', city: 'Vienna' });
      // The created row stays at the top of the page until the next load, and counts.
      expect(rowOf('99').nextElementSibling).toBe(rowOf('1'));
      expect(screen.getByText(/ of 61$/)).toBeTruthy();
    });

    it('goes away on "Cancel"', async () => {
      const createRow = vi.fn();

      render(<Editable createRow={createRow} />);
      await loaded();
      // A click in jsdom does not focus the button, a real one does.
      screen.getByRole('button', { name: 'Add' }).focus();
      click('Add');
      fireEvent.click(within(form()).getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(document.querySelector('[data-edit-form]')).toBeNull());
      expect(document.querySelectorAll('[data-editing]')).toHaveLength(0);
      expect(createRow).not.toHaveBeenCalled();
      // The focus goes back to "Add".
      expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Add' }));
    });

    it('can be added to an empty table (no empty state meanwhile)', async () => {
      render(<Editable createRow={vi.fn()} source={async () => ({ rows: [], total: 0 })} />);
      await loaded();

      expect(screen.getByText('No entries')).toBeTruthy();

      click('Add');

      expect(screen.queryByText('No entries')).toBeNull();
      expect(within(form()).getByRole('textbox', { name: 'Name' })).toBeTruthy();
    });

    it('is not added without createRow', async () => {
      render(<Editable saveRow={vi.fn()} />);
      await loaded();
      click('Add');

      expect(document.querySelector('[data-edit-form]')).toBeNull();
    });
  });

  it('edits nothing without saveRow', async () => {
    function WithoutSave(): ReactElement {
      const nav = useDataTableController<Person>();

      return (
        <Nav
          controller={nav}
          source={createSource()}
          rowKey="id"
          columns={editColumns}
          actions={[{ type: 'singleRow', key: 'edit', label: 'Edit', onClick: (row) => nav.editRow(row) }]}
        />
      );
    }

    render(<WithoutSave />);
    await loaded();
    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]!);

    expect(screen.queryByRole('textbox', { name: 'Name' })).toBeNull();
  });
});

describe('cards in a narrow table', () => {
  // jsdom has no layout: every element gets the width the test wants.
  const withWidth = (width: number) =>
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(
      { width, height: 0, x: 0, y: 0, top: 0, left: 0, right: width, bottom: 0, toJSON: () => ({}) } as DOMRect,
    );

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the rows as cards below 576px: a label and the content per column, no column headers', async () => {
    withWidth(400);
    const { container } = renderNav({ selection: 'multi' });

    await loaded();

    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'Name' })).toBeNull();
    expect(container.querySelector('[data-cards]')).not.toBeNull();

    const cards = screen.getAllByRole('listitem');
    const first = cards[0]!;

    expect(cards).toHaveLength(10);
    expect([...first.querySelectorAll('.data-table__card-label')].map((label) => label.textContent)).toEqual([
      'Name',
      'City',
    ]);
    expect(first.querySelector('.data-table__card-value')?.textContent).toBe('Person 01');
    expect(first.getAttribute('data-row-key')).toBe('1');
  });

  it('selects a card like a row: its checkbox, and a click on its free space', async () => {
    withWidth(400);
    renderNav({ selection: 'multi' });
    await loaded();

    const [first, second] = screen.getAllByRole('listitem');

    fireEvent.click(within(first!).getByRole('checkbox', { name: 'Select row' }));
    expect(first!.hasAttribute('data-selected')).toBe(true);
    expect(screen.getByText('1 selected')).toBeTruthy();

    // a plain click on the free space of the other card (its value, not the text) selects only that one
    fireEvent.click(second!.querySelector('.data-table__card-value')!);
    expect(first!.hasAttribute('data-selected')).toBe(false);
    expect(second!.hasAttribute('data-selected')).toBe(true);
  });

  it('shows the row actions in the bar of a card', async () => {
    withWidth(400);
    const onClick = vi.fn();

    renderNav({ actions: [{ type: 'singleRow', key: 'edit', label: 'Edit', onClick }] });
    await loaded();

    const first = screen.getAllByRole('listitem')[0]!;

    fireEvent.click(within(first).getByRole('button', { name: 'Edit' }));
    expect(onClick).toHaveBeenCalledWith(people[0]);
  });

  it('stays a table from 576px on', async () => {
    withWidth(576);
    renderNav();
    await loaded();

    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('chooses the layout in the column menu: automatic (the default), always the table, always cards', async () => {
    withWidth(900);
    renderNav();
    await loaded();

    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));

    const automatic = await screen.findByRole('menuitemradio', { name: 'Automatic' });

    expect(automatic.getAttribute('aria-checked')).toBe('true');
    expect(screen.getByRole('group', { name: 'Layout' })).toBeTruthy();

    // cards in a wide table; the column widths do not apply to them
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Cards' }));

    expect(await screen.findByRole('list')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByRole('menuitem', { name: 'Optimize column widths' }).getAttribute('aria-disabled')).toBe('true');

    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Table' }));

    expect(await screen.findByRole('table')).toBeTruthy();
  });

  it('is fixed by the layout prop: no choice in the column menu', async () => {
    withWidth(400);

    const { rerender } = renderNav({ layout: 'table' });

    await loaded();

    // a narrow table stays a table
    expect(screen.getByRole('table')).toBeTruthy();
    expect(screen.queryByRole('list')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    await screen.findByRole('menuitem', { name: 'Optimize column widths' });

    expect(screen.queryByRole('group', { name: 'Layout' })).toBeNull();
    expect(screen.queryByRole('menuitemradio', { name: 'Cards' })).toBeNull();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    rerender(<Nav source={createSource()} rowKey="id" columns={columns} layout="cards" />);

    // the prop changes the layout
    expect(await screen.findByRole('list')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('keeps the table in a narrow one when "Table" is chosen', async () => {
    withWidth(400);
    renderNav();
    await loaded();

    expect(screen.getByRole('list')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Columns' }));
    fireEvent.click(await screen.findByRole('menuitemradio', { name: 'Table' }));

    expect(await screen.findByRole('table')).toBeTruthy();
  });
});
