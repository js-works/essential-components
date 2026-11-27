import { describe, expect, it, vi } from 'vitest';

import type { NavTreeClassConfig, NavTreeItem, NavTreeElement as PublicNavTreeElement } from '../../main/index.js';
import { createNavTreeClass } from '../../main/nav-tree/create-nav-tree-class.js';

// The element as Lit has it: its `updateComplete` (not in the public type).
type NavTreeElement = PublicNavTreeElement & { readonly updateComplete: Promise<boolean> };

let tags = 0;

const ITEMS: readonly NavTreeItem[] = [
  { id: 'home', title: 'Home', href: '/home' },
  { id: 'ledger', title: 'General Ledger', href: '/ledger', group: 'Finance', subgroup: 'Accounting' },
  { id: 'budget', title: 'Budget', href: '/budget', group: 'Finance', description: 'Plan the budget' },
  { id: 'people', title: 'People', href: '/people', group: 'HR' },
];

async function mount(
  setup: (tree: NavTreeElement) => void = () => {},
  config: NavTreeClassConfig = {},
): Promise<NavTreeElement> {
  const tag = `test-nav-tree-${++tags}`;

  customElements.define(tag, createNavTreeClass(config));

  const tree = document.createElement(tag) as NavTreeElement;

  tree.items = ITEMS;
  setup(tree);
  document.body.append(tree);
  await tree.updateComplete;

  return tree;
}

const shadow = (tree: NavTreeElement) => tree.shadowRoot!;
const text = (element: Element | null | undefined) => element?.textContent?.replace(/\s+/g, ' ').trim();
const link = (tree: NavTreeElement, id: string) =>
  [...shadow(tree).querySelectorAll<HTMLAnchorElement>('a.item')].find((each) =>
    each.getAttribute('href') === `/${id}`
  )!;

describe('the nav tree', () => {
  it('the groups as headings, the items without a group first, the folders with their count', async () => {
    const tree = await mount();

    expect([...shadow(tree).querySelectorAll('.section-label')].map(text)).toEqual(['Finance', 'HR']);
    expect(text(shadow(tree).querySelector('.subgroup-trigger'))).toBe('Accounting 1');
    expect([...shadow(tree).querySelectorAll('a.item')].map(text)).toEqual([
      'Home',
      'Budget',
      'General Ledger',
      'People',
    ]);
    expect(link(tree, 'budget').title).toBe('Plan the budget');
  });

  it('the active item and the marked ones', async () => {
    const tree = await mount((element) => {
      element.active = 'ledger';
      element.marked = ['people'];
    });

    expect(link(tree, 'ledger').getAttribute('aria-current')).toBe('page');
    expect(link(tree, 'home').hasAttribute('aria-current')).toBe(false);
    expect(link(tree, 'people').querySelector('.dot')).not.toBeNull();
    expect(link(tree, 'home').querySelector('.dot')).toBeNull();
  });

  it('a plain click fires `navigate`; canceled, the link is not followed', async () => {
    const tree = await mount();
    const navigate = vi.fn((event: Event) => event.preventDefault());

    tree.addEventListener('navigate', navigate);

    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });

    link(tree, 'budget').dispatchEvent(click);
    expect((navigate.mock.calls[0]?.[0] as CustomEvent).detail).toEqual({ id: 'budget', href: '/budget' });
    expect(click.defaultPrevented).toBe(true);

    // With a modifier (a new tab): the browser's.
    link(tree, 'budget').dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }));
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('a folder opens and closes, remembered under the storage key', async () => {
    localStorage.clear();

    const tree = await mount(() => {}, { storageKey: 'test' });
    const trigger = shadow(tree).querySelector<HTMLButtonElement>('.subgroup-trigger')!;

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    trigger.click();
    await tree.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(JSON.parse(localStorage.getItem('test:groups')!)).toEqual({ 'Finance/Accounting': false });

    const again = await mount(() => {}, { storageKey: 'test' });

    expect(shadow(again).querySelector('.subgroup-trigger')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('collapsible groups: toggles with a count, "Other" for the items without a group', async () => {
    const tree = await mount((element) => {
      element.collapsibleGroups = true;
    });

    expect([...shadow(tree).querySelectorAll('.group-trigger')].map(text)).toEqual(['Other 1', 'Finance 2', 'HR 1']);

    const hr = shadow(tree).querySelectorAll<HTMLButtonElement>('.group-trigger')[2]!;

    hr.click();
    await tree.updateComplete;
    expect(hr.getAttribute('aria-expanded')).toBe('false');
    expect(hr.nextElementSibling?.hasAttribute('hidden')).toBe(true);
  });

  it('one group at a time: the select on top, the chosen group following the active item', async () => {
    const tree = await mount((element) => {
      element.groupDisplay = 'select';
      element.active = 'people';
    });
    const select = shadow(tree).querySelector<HTMLButtonElement>('.group-select')!;

    expect(text(select)).toBe('HR 1');
    expect([...shadow(tree).querySelectorAll('a.item')].map(text)).toEqual(['People']);
    expect(shadow(tree).querySelector('.section-label')).toBeNull();
    expect([...shadow(tree).querySelectorAll('.select-item')].map(text)).toEqual(['Other 1', 'Finance 2', 'HR 1']);

    tree.active = 'budget';
    await tree.updateComplete;
    expect(text(shadow(tree).querySelector('.group-select'))).toBe('Finance 2');
  });

  it('the slots top and bottom: their room only with content; the list scrolls between them, the select above it', async () => {
    const tree = await mount((element) => {
      element.innerHTML = '<input slot="top" type="search"><a slot="bottom" href="/help">Help</a>';
      element.groupDisplay = 'select';
    });

    await new Promise((resolve) => setTimeout(resolve));
    await tree.updateComplete;

    const layout = shadow(tree).querySelector('.layout')!;
    // The select's list is a popover (the top layer): not a part of the column.
    const parts = [...layout.children].map((child) => child.className).filter((name) => name !== 'select-positioner');

    expect(parts).toEqual(['top', 'group-select', 'scroll', 'bottom']);
    expect(shadow(tree).querySelector<HTMLElement>('.top')!.hidden).toBe(false);
    expect(shadow(tree).querySelector<HTMLElement>('.bottom')!.hidden).toBe(false);

    tree.innerHTML = '';
    await new Promise((resolve) => setTimeout(resolve));
    await tree.updateComplete;

    expect(shadow(tree).querySelector<HTMLElement>('.top')!.hidden).toBe(true);
    expect(shadow(tree).querySelector<HTMLElement>('.bottom')!.hidden).toBe(true);
  });
});
