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

function renderApp(path: string, language = 'en') {
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
    staticData: { crumb: () => 'Projects' },
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

    await waitFor(() => expect(screen.getByText('Projects')).toBeTruthy());
    expect(screen.getByText('Files', { selector: 'a' }).getAttribute('href')).toBe('/files');
  });

  it('shows the icon, the title and the modules, the current one active', async () => {
    renderApp('/projects/7');

    await waitFor(() => expect(screen.getByText('Detail')).toBeTruthy());

    const tabs = document.querySelectorAll('.micro-app__module');

    expect([...tabs].map((tab) => tab.textContent)).toEqual(['Overview', 'Projects']);
    expect(tabs[1]?.getAttribute('data-status')).toBe('active');
    expect(tabs[0]?.getAttribute('data-status')).not.toBe('active');
  });

  it('shows the breadcrumb: Home as a link, the crumbs of the route, the last one no link', async () => {
    renderApp('/projects/7');

    await waitFor(() => expect(screen.getByText('Project 7')).toBeTruthy());

    const crumbs = document.querySelector('.micro-app__crumbs')!;

    expect(crumbs.textContent).toContain('Home');
    expect(screen.getByText('Home').closest('a')?.getAttribute('href')).toBe('/');
    expect(screen.getByText('Projects', { selector: '.micro-app__crumb' }).closest('a')?.getAttribute('href'))
      .toBe('/projects');
    expect(screen.getByText('Project 7').closest('a')).toBeNull();
  });

  it('shows Home alone, no link, on the start page; in German "Start"', async () => {
    renderApp('/', 'de');

    await waitFor(() => expect(screen.getByText('Start', { selector: 'p' })).toBeTruthy());

    expect(document.querySelector('.micro-app__crumbs a')).toBeNull();
    expect(document.querySelector('.micro-app__home')?.textContent).toBe('Start');
  });

  it('has Back and Forward through the history, disabled at either end', async () => {
    const router = renderApp('/');
    const back = () => screen.getByRole('button', { name: 'Back' });
    const forward = () => screen.getByRole('button', { name: 'Forward' });

    await waitFor(() => expect(screen.getByText('Start')).toBeTruthy());

    expect(back().hasAttribute('disabled')).toBe(true);
    expect(forward().hasAttribute('disabled')).toBe(true);

    await act(() => router.navigate({ to: '/projects' }));
    await waitFor(() => expect(back().hasAttribute('disabled')).toBe(false));

    await act(async () => back().click());
    await waitFor(() => expect(screen.getByText('Start')).toBeTruthy());
    await waitFor(() => expect(forward().hasAttribute('disabled')).toBe(false));
    expect(back().hasAttribute('disabled')).toBe(true);
  });
});
