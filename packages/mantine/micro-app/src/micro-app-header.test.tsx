import { MantineProvider } from '@mantine/core';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import type { AppHeaderElement } from '@local/cockpit';

import { MicroAppHeader } from './micro-app-header.js';
import { microAppResources } from './texts.js';

// jsdom has no `matchMedia` (Mantine reads the color scheme with it).
beforeAll(() => {
  window.matchMedia ??= ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

afterEach(cleanup);

function renderApp(path: string, language = 'en', moduleCrumb = true) {
  const i18n = createInstance();

  void i18n.use(initReactI18next).init({
    lng: language,
    resources: microAppResources,
    initAsync: false,
  });

  const root = createRootRoute({
    component: () => (
      <>
        <MicroAppHeader
          icon="P"
          title="Projects"
          modules={[
            { to: '/', label: 'Overview', exact: true },
            { to: '/projects', label: 'Projects' },
          ]}
        />
        <Outlet />
      </>
    ),
  });
  const overview = createRoute({ getParentRoute: () => root, path: '/', component: () => <p>Start</p> });
  const projects = createRoute({
    getParentRoute: () => root,
    path: '/projects',
    staticData: moduleCrumb ? { crumb: () => 'Projects' } : {},
  });
  const projectList = createRoute({ getParentRoute: () => projects, path: '/', component: () => <p>List</p> });
  const project = createRoute({
    getParentRoute: () => projects,
    path: '$projectId',
    staticData: { crumb: (params) => `Project ${params['projectId']}` },
    component: () => <p>Detail</p>,
  });
  const router = createRouter({
    routeTree: root.addChildren([overview, projects.addChildren([projectList, project])]),
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  render(
    <I18nextProvider i18n={i18n}>
      <MantineProvider>
        <RouterProvider router={router} />
      </MantineProvider>
    </I18nextProvider>,
  );

  return router;
}

// The header's element: its tag is the first `internal-micro-app-header-<n>` not registered yet.
function header(): AppHeaderElement {
  return [...document.body.querySelectorAll('*')].find((element) =>
    element.localName.startsWith('internal-micro-app-header-')
  ) as AppHeaderElement;
}

// The slotted content of a crumb (its label, a React node).
const crumbText = (index: number) => header().querySelector(`[slot="crumb-${index}"]`)?.textContent;

describe('MicroAppHeader', () => {
  it('shows the app\'s own crumbs where it gives them', async () => {
    const i18n = createInstance();

    void i18n.use(initReactI18next).init({ lng: 'en', resources: microAppResources, initAsync: false });

    const root = createRootRoute({
      component: () => (
        <MicroAppHeader
          icon="F"
          title="Files"
          modules={[]}
          crumbs={[{ to: '/files', label: 'Files' }, { to: '/files/f1', label: 'Projects' }]}
        />
      ),
    });
    const router = createRouter({ routeTree: root, history: createMemoryHistory({ initialEntries: ['/'] }) });

    render(
      <I18nextProvider i18n={i18n}>
        <MantineProvider>
          <RouterProvider router={router} />
        </MantineProvider>
      </I18nextProvider>,
    );

    await waitFor(() => expect(header()?.crumbs).toHaveLength(2));
    expect(header().crumbs.map((crumb) => crumb.href)).toEqual(['/files', '/files/f1']);
    expect([crumbText(0), crumbText(1)]).toEqual(['Files', 'Projects']);
  });

  it('sets the title, the modules with their hrefs and the current one', async () => {
    renderApp('/projects/7');

    await waitFor(() => expect(screen.getByText('Detail')).toBeTruthy());

    expect(header().heading).toBe('Projects');
    expect(header().modules.map((module) => [module.label, module.href])).toEqual([
      ['Overview', '/'],
      ['Projects', '/projects'],
    ]);
    expect(header().activeModule).toBe('/projects');
    expect(header().homeHref).toBe('/');
  });

  it('sets the crumbs of the route', async () => {
    renderApp('/projects/7');

    await waitFor(() => expect(header()?.crumbs).toHaveLength(2));
    expect(header().crumbs.map((crumb) => crumb.href)).toEqual(['/projects', '/projects/7']);
    expect([crumbText(0), crumbText(1)]).toEqual(['Projects', 'Project 7']);
  });

  it('sets the current module as a crumb where no route has one for its path', async () => {
    renderApp('/projects/7', 'en', false);

    await waitFor(() => expect(header()?.crumbs).toHaveLength(2));
    expect([crumbText(0), crumbText(1)]).toEqual(['Projects', 'Project 7']);
  });

  it('sets no crumbs on the start page, its tab the current one', async () => {
    renderApp('/');

    await waitFor(() => expect(screen.getByText('Start')).toBeTruthy());
    expect(header().crumbs).toEqual([]);
    expect(header().activeModule).toBe('/');
  });

  it('gives the element its texts in the app\'s language', async () => {
    renderApp('/projects/7', 'de');

    await waitFor(() => expect(header()?.shadowRoot?.innerHTML).toContain('Navigationspfad'));
  });

  it('navigates with the router on the element\'s `navigate`', async () => {
    const router = renderApp('/');

    await waitFor(() => expect(screen.getByText('Start')).toBeTruthy());

    const event = new CustomEvent('navigate', { detail: { href: '/projects/3' }, cancelable: true });

    act(() => void header().dispatchEvent(event));

    expect(event.defaultPrevented).toBe(true);
    await waitFor(() => expect(router.state.location.pathname).toBe('/projects/3'));
  });

  it('has Back and Forward through the history, with the pages they lead to', async () => {
    const router = renderApp('/');

    await waitFor(() => expect(screen.getByText('Start')).toBeTruthy());
    expect(header().back).toBeNull();
    expect(header().forward).toBeNull();

    await act(() => router.navigate({ to: '/projects/7' }));
    await waitFor(() => expect(header().back).not.toBeNull());
    expect(header().querySelector('[slot="back-page"]')?.textContent).toBe('Home');

    act(() => void header().dispatchEvent(new CustomEvent('back', { cancelable: true })));
    await waitFor(() => expect(screen.getByText('Start')).toBeTruthy());
    await waitFor(() => expect(header().forward).not.toBeNull());
    expect(header().back).toBeNull();
    expect(header().querySelector('[slot="forward-page"]')?.textContent).toBe('Project 7');
  });
});
