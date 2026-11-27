import { act, cleanup, render, waitFor } from '@testing-library/react';
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { I18nAdapter, NavTreeElement, NavTreeItem, StatusViewElement } from '../../main/index.js';
import {
  createAppHeaderComponent,
  createLoginComponent,
  createNavTreeComponent,
  createStatusViewComponent,
  createSystemBannerComponent,
} from '../../main/react/index.js';

afterEach(cleanup);

const ITEMS: readonly NavTreeItem[] = [
  { id: 'projects', title: 'Projects', href: '/projects', group: 'Work' },
  { id: 'budget', title: 'Budget', href: '/budget', group: 'Finance' },
];

// The element, once the placeholder was replaced and it has rendered.
async function elementIn<E extends HTMLElement>(container: HTMLElement, name: string): Promise<E> {
  const element = await waitFor(() => {
    const found = [...container.querySelectorAll('*')].find((node) =>
      node.localName.startsWith(`internal-cockpit-${name}-`)
    );

    expect(found).toBeDefined();

    return found as E & { updateComplete: Promise<unknown> };
  });

  await (element as E & { updateComplete: Promise<unknown> }).updateComplete;
  await new Promise((resolve) => setTimeout(resolve));

  return element;
}

describe('the React components', () => {
  it('a placeholder first, then the element under an internal tag', async () => {
    const NavTree = createNavTreeComponent();
    const { container } = render(<NavTree items={ITEMS} className="tree" />);

    expect(container.firstElementChild?.localName).toBe('div');
    expect(container.firstElementChild?.getAttribute('aria-busy')).toBe('true');

    const element = await elementIn<NavTreeElement>(container, 'nav-tree');

    expect(element.localName).toMatch(/^internal-cockpit-nav-tree-\d+$/);
    expect(element.className).toBe('tree');
    expect(element.items).toBe(ITEMS);
  });

  it('props as properties (a missing one the default), the event as a callback, the slots, the ref', async () => {
    const NavTree = createNavTreeComponent();
    const onNavigate = vi.fn((event: CustomEvent) => event.preventDefault());
    const ref = createRef<NavTreeElement>();
    const { container, rerender } = render(
      <NavTree ref={ref} items={ITEMS} active="projects" onNavigate={onNavigate} top={<b>Title</b>} />,
    );
    const element = await elementIn<NavTreeElement>(container, 'nav-tree');

    expect(ref.current).toBe(element);
    expect(element.active).toBe('projects');
    expect(element.querySelector('[slot="top"] b')?.textContent).toBe('Title');
    expect(element.querySelector('[slot="bottom"]')).toBeNull();

    element.shadowRoot!.querySelector<HTMLAnchorElement>('a[href="/budget"]')!.click();
    expect(onNavigate).toHaveBeenCalledOnce();
    expect(onNavigate.mock.calls[0]![0].detail).toEqual({ id: 'budget', href: '/budget' });

    rerender(<NavTree ref={ref} items={ITEMS} onNavigate={onNavigate} />);
    expect(element.active).toBe('');
  });

  it('the hook\'s adapter on the element; a new one renders it again', async () => {
    const adapterFor = (heading: string): I18nAdapter => ({
      currentLocale: () => 'de-DE',
      translate: (_namespace, key) => (key === 'statusViewEmpty' ? heading : null),
    });
    let adapter = adapterFor('Noch leer');
    const StatusView = createStatusViewComponent({ useI18n: () => adapter });
    const { container, rerender } = render(<StatusView kind="empty" />);
    const element = await elementIn<StatusViewElement>(container, 'status-view');

    expect(element.shadowRoot!.querySelector('.heading')?.textContent).toBe('Noch leer');

    adapter = adapterFor('Leer');
    rerender(<StatusView kind="empty" />);
    await (element as StatusViewElement & { updateComplete: Promise<unknown> }).updateComplete;

    expect(element.shadowRoot!.querySelector('.heading')?.textContent).toBe('Leer');
  });

  it('the status view\'s action; the login\'s form as its children, submitted by its button', async () => {
    const StatusView = createStatusViewComponent();
    const onAction = vi.fn();
    const first = render(<StatusView actionLabel="Try again" onAction={onAction} />);
    const view = await elementIn<HTMLElement>(first.container, 'status-view');

    view.shadowRoot!.querySelector<HTMLButtonElement>('.primary')!.click();
    expect(onAction).toHaveBeenCalledOnce();

    const Login = createLoginComponent();
    const onSubmit = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    const second = render(
      <Login submitLabel="Sign in">
        <form onSubmit={onSubmit}>
          <input name="user" />
        </form>
      </Login>,
    );
    const login = await elementIn<HTMLElement>(second.container, 'login');

    expect(login.querySelector(':scope > form')).not.toBeNull();
    act(() => login.shadowRoot!.querySelector<HTMLButtonElement>('.primary')!.click());
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('the app header\'s crumbs as slots, its events as callbacks', async () => {
    const AppHeader = createAppHeaderComponent();
    const onBack = vi.fn((event: Event) => event.preventDefault());
    const { container } = render(
      <AppHeader
        heading="Boards"
        crumbs={[{ label: '', href: '/boards' }]}
        crumbLabels={[<i key="b">Boards</i>]}
        back={{}}
        onBack={onBack}
      />,
    );
    const header = await elementIn<HTMLElement>(container, 'app-header');

    expect(header.querySelector('[slot="crumb-0"] i')?.textContent).toBe('Boards');
    header.shadowRoot!.querySelector<HTMLButtonElement>('.history-button')!.click();
    expect(onBack).toHaveBeenCalledOnce();
  });

  it('the system banner\'s dismiss as a callback: preventDefault() keeps it', async () => {
    const SystemBanner = createSystemBannerComponent();
    const onDismiss = vi.fn((event: Event) => event.preventDefault());
    const { container } = render(<SystemBanner tone="warning" message="Staging" dismissible onDismiss={onDismiss} />);
    const banner = await elementIn<HTMLElement>(container, 'system-banner');

    banner.shadowRoot!.querySelector<HTMLButtonElement>('.close')!.click();
    expect(onDismiss).toHaveBeenCalledOnce();
    expect(banner.hidden).toBe(false);
  });
});
