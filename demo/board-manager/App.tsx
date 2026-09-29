import { Anchor, Breadcrumbs, Group, Menu, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import { createMemoryRouter, Link, Outlet, useLocation, useMatches } from 'react-router';
import type { Params, RouteObject } from 'react-router';
import { getBoard, getMeeting } from './db';
import { BoardPage } from './pages/BoardPage';
import { BoardsPage } from './pages/BoardsPage';
import { HomePage } from './pages/HomePage';
import { MeetingPage } from './pages/MeetingPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { MembersPage } from './pages/MembersPage';
import { NotFound } from './pages/NotFound';
import { appIcons, useDb } from './shared';

export { createAppRouter };

// The app: a top bar (the app icon, the title with the menu of the modules, the breadcrumb) and the page of the route.
// No side navigation: the app is embedded in a page with content around it (later e.g. XWiki), where there is little
// horizontal space.

const MODULES = [
  { path: '/boards', label: 'Boards', icon: appIcons.boards },
  { path: '/meetings', label: 'Meetings', icon: appIcons.meetings },
  { path: '/members', label: 'Members', icon: appIcons.members },
] as const;

// A route with a crumb in the breadcrumb (its `handle`).
type Crumb = { crumb: (params: Params) => ReactNode };

function hasCrumb(handle: unknown): handle is Crumb {
  return typeof handle === 'object' && handle !== null && 'crumb' in handle;
}

function BoardCrumb({ id }: { id: string | undefined }): ReactNode {
  return useDb((state) => getBoard(state, id)?.name) ?? 'Board';
}

function MeetingCrumb({ id }: { id: string | undefined }): ReactNode {
  return useDb((state) => getMeeting(state, id)?.title) ?? 'Meeting';
}

// A meeting is below its board, and below "Meetings".
const meetingRoute = (): RouteObject => ({
  path: ':meetingId',
  element: <MeetingPage />,
  handle: { crumb: (params) => <MeetingCrumb id={params['meetingId']} /> } satisfies Crumb,
});

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'boards',
        handle: { crumb: () => 'Boards' } satisfies Crumb,
        children: [
          { index: true, element: <BoardsPage /> },
          {
            path: ':boardId',
            handle: { crumb: (params) => <BoardCrumb id={params['boardId']} /> } satisfies Crumb,
            children: [
              { index: true, element: <BoardPage /> },
              { path: 'meetings', children: [meetingRoute()] },
            ],
          },
        ],
      },
      {
        path: 'meetings',
        handle: { crumb: () => 'Meetings' } satisfies Crumb,
        children: [{ index: true, element: <MeetingsPage /> }, meetingRoute()],
      },
      { path: 'members', handle: { crumb: () => 'Members' } satisfies Crumb, element: <MembersPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
];

function Layout(): ReactElement {
  return (
    <div className="board-manager__app">
      <TopBar />
      <main className="board-manager__main">
        <Outlet />
      </main>
    </div>
  );
}

function TopBar(): ReactElement {
  return (
    <header className="board-manager__top-bar">
      <Group gap="xs" wrap="nowrap">
        <ThemeIcon variant="filled" size="lg" radius="sm" aria-hidden>{appIcons.app}</ThemeIcon>
        <Menu position="bottom-start" shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton className="board-manager__title" aria-label="Board Manager: modules">
              <Group gap={4} wrap="nowrap">
                <Text fw={700} size="md">Board Manager</Text>
                {appIcons.chevronDown}
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component={Link} to="/" leftSection={appIcons.home}>Home</Menu.Item>
            <Menu.Divider />
            {MODULES.map((module) => (
              <Menu.Item key={module.path} component={Link} to={module.path} leftSection={module.icon}>
                {module.label}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </Group>
      <Crumbs />
    </header>
  );
}

// Home (a neutral icon, and the text as the link), then one crumb per level of the route; the last one is the current
// page (not a link). On the home page, Home is the current page itself.
function Crumbs(): ReactElement {
  const matches = useMatches().filter((match) => hasCrumb(match.handle));
  const atHome = useLocation().pathname === '/';

  return (
    <Breadcrumbs separator="›" separatorMargin={6} className="board-manager__crumbs">
      <span className="board-manager__home">
        <Text component="span" c="dimmed" display="inline-flex">{appIcons.home}</Text>
        {atHome
          ? <Text component="span" size="sm" fw={500} aria-current="page">Home</Text>
          : <Anchor component={Link} to="/" size="sm">Home</Anchor>}
      </span>
      {matches.map((match, index) => {
        const crumb = hasCrumb(match.handle) ? match.handle.crumb(match.params) : null;

        return index === matches.length - 1
          ? <Text key={match.id} size="sm" fw={500} aria-current="page">{crumb}</Text>
          : <Anchor key={match.id} component={Link} to={match.pathname} size="sm">{crumb}</Anchor>;
      })}
    </Breadcrumbs>
  );
}

// The routes live in memory, and are mirrored in the URL hash after the segment of the page's tab:
// `#board-manager/boards/b1/meetings/m12`. So a reload (or a shared link) opens the same page. The page's tabs keep
// their own segments (`ui.ts`): the route is written only while the app's tab is shown, and again when it is chosen.
const HASH = '#board-manager';

function pathFromHash(): string | undefined {
  const { hash } = location;

  return hash === HASH ? '/' : hash.startsWith(`${HASH}/`) ? hash.slice(HASH.length) : undefined;
}

// Without an element (the `<board-manager>` element, whose host page owns the URL), only the memory router.
function createAppRouter(
  element?: HTMLElement,
): { router: ReturnType<typeof createMemoryRouter>; dispose: () => void } {
  if (element === undefined) {
    const router = createMemoryRouter(routes);

    return { router, dispose: () => router.dispose() };
  }

  const router = createMemoryRouter(routes, { initialEntries: [pathFromHash() ?? '/'] });

  const writeHash = () => {
    if (element.closest('[hidden]') !== null) {
      return;
    }

    const path = router.state.location.pathname;
    const hash = path === '/' ? HASH : `${HASH}${path}`;

    if (location.hash !== hash) {
      history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
    }
  };

  const readHash = () => {
    const path = pathFromHash();

    if (path !== undefined && path !== router.state.location.pathname) {
      void router.navigate(path);
    }
  };

  const unsubscribe = router.subscribe(writeHash);
  // The tab's panel is shown (`hidden` removed) when its tab is chosen: then the tabs have just written `#board-manager`.
  const observer = new MutationObserver(writeHash);
  const panel = element.closest('.ui-tabs__panel');

  if (panel !== null) {
    observer.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  }

  window.addEventListener('hashchange', readHash);

  return {
    router,
    dispose: () => {
      unsubscribe();
      observer.disconnect();
      window.removeEventListener('hashchange', readHash);
      router.dispose();
    },
  };
}
