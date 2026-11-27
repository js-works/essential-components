import { afterEach, describe, expect, it } from 'vitest';

import type { NavItem, CockpitElement as PublicCockpitElement } from '../../main/index.js';
import { createCockpitClass, routeByHash } from '../../main/index.js';

// The element as Lit has it: its `updateComplete` (not in the public type).
type CockpitElement = PublicCockpitElement & { readonly updateComplete: Promise<boolean> };

const ITEMS: readonly NavItem[] = [
  { id: 'one', title: 'One', element: 'div' },
  { id: 'two', title: 'Two', element: 'div' },
];

let tags = 0;

// A new class and a connected element, its properties set after it is connected (like a host does).
async function mount(setup: (cockpit: CockpitElement) => void = () => {}): Promise<CockpitElement> {
  const tag = `test-cockpit-${++tags}`;

  customElements.define(tag, createCockpitClass());

  const cockpit = document.createElement(tag) as CockpitElement;

  document.body.append(cockpit);
  setup(cockpit);
  await cockpit.updateComplete;
  await cockpit.updateComplete;

  return cockpit;
}

afterEach(() => {
  history.replaceState(null, '', location.pathname);
});

describe('the cockpit element', () => {
  it('nothing before the items; then `active`, else the default (which `active` becomes); the URL untouched', async () => {
    const empty = await mount();

    expect(empty.activeItem).toBeUndefined();

    empty.items = ITEMS;
    await empty.updateComplete;
    expect(empty.activeItem?.id).toBe('one');
    expect(empty.active).toBe('one');

    const withActive = await mount((cockpit) => {
      cockpit.items = ITEMS;
      cockpit.active = 'two';
    });

    expect(withActive.activeItem?.id).toBe('two');

    const withDefault = await mount((cockpit) => {
      cockpit.items = ITEMS;
      cockpit.defaultItem = 'two';
    });

    expect(withDefault.activeItem?.id).toBe('two');
    expect(location.hash).toBe('');
  });

  it('open(): navigate, then active; canceled, a router sets active itself', async () => {
    const cockpit = await mount((element) => {
      element.items = ITEMS;
    });
    const asked: string[] = [];

    cockpit.addEventListener('navigate', (event) => asked.push((event as CustomEvent<{ id: string }>).detail.id));
    cockpit.open('two');
    await cockpit.updateComplete;
    expect([asked, cockpit.active, cockpit.activeItem?.id]).toEqual([['two'], 'two', 'two']);

    const router = (event: Event) => event.preventDefault();

    cockpit.addEventListener('navigate', router);
    cockpit.open('one');
    await cockpit.updateComplete;
    expect([cockpit.active, cockpit.activeItem?.id]).toEqual(['two', 'two']);

    cockpit.active = 'one';
    await cockpit.updateComplete;
    expect(cockpit.activeItem?.id).toBe('one');
    expect(location.hash).toBe('');
  });

  it('routeByHash(): the hash\'s item at the start, navigate as a history entry, a change of the hash', async () => {
    history.replaceState(null, '', `${location.pathname}#two/page`);

    const cockpit = await mount((element) => {
      element.items = ITEMS;
    });
    const stop = routeByHash(cockpit);

    await cockpit.updateComplete;
    expect(cockpit.activeItem?.id).toBe('two');

    cockpit.open('one');
    await cockpit.updateComplete;
    expect(location.hash).toBe('#one');
    expect(cockpit.activeItem?.id).toBe('one');

    history.replaceState(null, '', `${location.pathname}#two`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await cockpit.updateComplete;
    expect(cockpit.activeItem?.id).toBe('two');

    // A segment that is no item (a host's anchor): left alone.
    history.replaceState(null, '', `${location.pathname}#top`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    await cockpit.updateComplete;
    expect(cockpit.activeItem?.id).toBe('two');
    stop();
  });

  it('an open item no longer in the items is closed; the one used before it is shown', async () => {
    const cockpit = await mount((element) => {
      element.items = ITEMS;
    });

    cockpit.open('two');
    // The item's element is created after its `load()` (none here: a microtask).
    await new Promise((resolve) => setTimeout(resolve));
    expect(cockpit.activeItem?.id).toBe('two');
    expect(cockpit.querySelectorAll(':scope > div')).toHaveLength(2);

    cockpit.items = [ITEMS[0]!];
    await cockpit.updateComplete;

    expect(cockpit.activeItem?.id).toBe('one');
    expect(cockpit.querySelectorAll(':scope > div')).toHaveLength(1);
  });

  it('the headline and the subheadline, switchable live; the defaults of the properties', async () => {
    const cockpit = await mount((element) => {
      element.items = ITEMS;
      element.headline = 'Back Office';
      element.subheadline = 'Acme Corporate';
    });
    const brand = () => cockpit.shadowRoot!.querySelector('.brand-title')?.textContent;

    expect(brand()).toBe('Back Office');
    expect(cockpit.shadowRoot!.querySelector('.brand-subtitle')?.textContent).toBe('Acme Corporate');

    cockpit.headline = 'Front Office';
    await cockpit.updateComplete;
    expect(brand()).toBe('Front Office');
    expect(cockpit.getAttribute('title')).toBeNull();

    expect({
      search: cockpit.search,
      collapsibleGroups: cockpit.collapsibleGroups,
      recentCount: cockpit.recentCount,
      taskbar: cockpit.taskbar,
      user: cockpit.user,
      groupDisplay: cockpit.groupDisplay,
    }).toEqual({
      search: 'auto',
      collapsibleGroups: 'auto',
      recentCount: 5,
      taskbar: false,
      user: null,
      groupDisplay: 'sections',
    });
  });

  it('the attributes: headline, search, recent-count, taskbar', async () => {
    const cockpit = await mount((element) => {
      element.items = ITEMS;
      element.setAttribute('headline', 'Office');
      element.setAttribute('search', 'never');
      element.setAttribute('recent-count', '3');
      element.setAttribute('taskbar', '');
    });

    expect([cockpit.headline, cockpit.search, cockpit.recentCount, cockpit.taskbar]).toEqual([
      'Office',
      'never',
      3,
      true,
    ]);
  });
});
