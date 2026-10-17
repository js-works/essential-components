import '@mantine/core/styles.layer.css';
import '../src/styles.css';
import { Anchor, MantineProvider, Stack, Table, Text, Title } from '@mantine/core';
import {
  createLink,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  RouterProvider,
} from '@tanstack/react-router';
import { createInstance } from 'i18next';
import type { ComponentPropsWithRef } from 'react';
import { useEffect, useState } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import { MicroAppHeader, microAppResources } from '../src/index.js';

export { Demo };

// The class of the demo's Mantine scope: Mantine's variables and color scheme are set on it, not on `:root`.
const SCOPE_CLASS = 'micro-app-demo';

const PROJECTS = [
  { id: 'p1', name: 'Website relaunch', lead: 'Helena Brandt' },
  { id: 'p2', name: 'New ERP', lead: 'Jonas Weber' },
  { id: 'p3', name: 'Office move', lead: 'Maria Keller' },
];

// The demo's i18next instance: the building blocks' texts (`microApp`), the language of `<html lang>`.
const i18n = createInstance();

void i18n.use(initReactI18next).init({
  lng: document.documentElement.lang.startsWith('de') ? 'de' : 'en',
  fallbackLng: 'en',
  resources: microAppResources,
  initAsync: false,
});

new MutationObserver(() => void i18n.changeLanguage(document.documentElement.lang.startsWith('de') ? 'de' : 'en'))
  .observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

function AnchorBase(props: ComponentPropsWithRef<'a'>) {
  return <Anchor component="a" {...props} />;
}

const AnchorLink = createLink(AnchorBase);

const rootRoute = createRootRoute({
  component: () => (
    <>
      <MicroAppHeader
        icon="P"
        title="Projects"
        modules={[
          { to: '/', label: 'Overview', exact: true },
          { to: '/projects', label: 'Projects' },
          { to: '/people', label: 'People' },
        ]}
      />
      <main className="micro-app-demo__page">
        <Outlet />
      </main>
    </>
  ),
});

const overviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => (
    <Stack>
      <Title order={2}>Overview</Title>
      <Text>A micro-app with the header of `@local/micro-app`: the modules, the breadcrumb, Back and Forward.</Text>
    </Stack>
  ),
});

const projectsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/projects',
  staticData: { crumb: () => 'Projects' },
});

const projectListRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '/',
  component: () => (
    <Table>
      <Table.Tbody>
        {PROJECTS.map((project) => (
          <Table.Tr key={project.id}>
            <Table.Td>
              <AnchorLink to="/projects/$projectId" params={{ projectId: project.id }}>{project.name}</AnchorLink>
            </Table.Td>
            <Table.Td>{project.lead}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  ),
});

const projectRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '$projectId',
  staticData: { crumb: (params) => PROJECTS.find((project) => project.id === params['projectId'])?.name },
  component: function ProjectPage() {
    const { projectId } = projectRoute.useParams();
    const project = PROJECTS.find((candidate) => candidate.id === projectId);

    return <Title order={2}>{project?.name ?? 'Not found'}</Title>;
  },
});

const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/people',
  staticData: { crumb: () => 'People' },
  component: () => <Text>Everyone in the projects.</Text>,
});

const routeTree = rootRoute.addChildren([
  overviewRoute,
  projectsRoute.addChildren([projectListRoute, projectRoute]),
  peopleRoute,
]);

// One router per demo element (a memory history: the demo shares the page's URL with others).
const createDemoRouter = () => createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) });

// The page's color scheme (`<html>`: its computed `color-scheme`), followed while it changes.
function useScheme(): 'light' | 'dark' {
  const read = (): 'light' | 'dark' => {
    const scheme = getComputedStyle(document.documentElement).colorScheme;

    return scheme.includes('dark') && !scheme.includes('light') ? 'dark' : 'light';
  };
  const [scheme, setScheme] = useState(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setScheme(read()));

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  return scheme;
}

function Demo() {
  const scheme = useScheme();
  const [router] = useState(createDemoRouter);

  return (
    <I18nextProvider i18n={i18n}>
      <MantineProvider
        forceColorScheme={scheme}
        cssVariablesSelector={`.${SCOPE_CLASS}`}
        deduplicateCssVariables={false}
        getRootElement={() => undefined}
      >
        <div className={SCOPE_CLASS} data-mantine-color-scheme={scheme}>
          <RouterProvider router={router} />
        </div>
      </MantineProvider>
    </I18nextProvider>
  );
}
