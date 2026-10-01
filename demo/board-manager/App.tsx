import { ActionIcon, Anchor, Breadcrumbs, Group, Menu, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import {
  createMemoryRouter,
  Link,
  matchRoutes,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
  useNavigationType,
} from 'react-router';
import type { Params, RouteObject } from 'react-router';
import { getBoard, getMeeting, getOrganization, getPerson } from './db';
import { BoardPage } from './pages/BoardPage';
import { BoardsPage } from './pages/BoardsPage';
import { HomePage } from './pages/HomePage';
import { MeetingPage } from './pages/MeetingPage';
import { MeetingsPage } from './pages/MeetingsPage';
import { MemberPage } from './pages/MemberPage';
import { MembersPage } from './pages/MembersPage';
import { NotFound } from './pages/NotFound';
import { OrganizationPage } from './pages/OrganizationPage';
import { OrganizationsPage } from './pages/OrganizationsPage';
import { appIcons, useDb } from './shared';

export { createAppRouter };

// The app: a top bar (the app icon, the title with the menu of the modules, the breadcrumb) and the page of the route.
// No side navigation: the app is embedded in a page with content around it (later e.g. XWiki), where there is little
// horizontal space.

const MODULES = [
  { path: '/boards', label: 'Boards', icon: appIcons.boards },
  { path: '/meetings', label: 'Meetings', icon: appIcons.meetings },
  { path: '/members', label: 'Members', icon: appIcons.members },
  { path: '/organizations', label: 'Organizations', icon: appIcons.organizations },
] as const;

// A route with a crumb in the breadcrumb (its `handle`).
type Crumb = { crumb: (params: Params) => ReactNode };

function hasCrumb(handle: unknown): handle is Crumb {
  return typeof handle === 'object' && handle !== null && 'crumb' in handle;
}

function BoardCrumb({ id }: { id: string | undefined }): ReactNode {
  return useDb((state) => getBoard(state, id)?.name) ?? 'Board';
}

function MemberCrumb({ id }: { id: string | undefined }): ReactNode {
  return useDb((state) => getPerson(state, id)?.name) ?? 'Member';
}

function OrganizationCrumb({ id }: { id: string | undefined }): ReactNode {
  return useDb((state) => getOrganization(state, id)?.name) ?? 'Organization';
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
      {
        path: 'members',
        handle: { crumb: () => 'Members' } satisfies Crumb,
        children: [
          { index: true, element: <MembersPage /> },
          {
            path: ':personId',
            handle: { crumb: (params) => <MemberCrumb id={params['personId']} /> } satisfies Crumb,
            element: <MemberPage />,
          },
        ],
      },
      {
        path: 'organizations',
        handle: { crumb: () => 'Organizations' } satisfies Crumb,
        children: [
          { index: true, element: <OrganizationsPage /> },
          {
            path: ':organizationId',
            handle: { crumb: (params) => <OrganizationCrumb id={params['organizationId']} /> } satisfies Crumb,
            element: <OrganizationPage />,
          },
        ],
      },
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
      <Group gap="xs" wrap="nowrap" flex="none">
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
      <HistoryButtons />
    </header>
  );
}

// Back and Forward through the app's own history, like the browser's buttons: the routes live in memory (the hash
// only mirrors them, with `replaceState`), so the browser's buttons do not step through the app's pages. Their tooltips
// say where they go ("Back to Boards").
function HistoryButtons(): ReactElement {
  const navigate = useNavigate();
  const { back, forward } = useHistoryPosition();

  return (
    <Group gap={4} ml="auto" wrap="nowrap" className="board-manager__history">
      <Tooltip label={<HistoryTip text="Back" path={back} />} openDelay={400} fz="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          disabled={back === undefined}
          onClick={() => void navigate(-1)}
          aria-label="Back"
        >
          {appIcons.back}
        </ActionIcon>
      </Tooltip>
      <Tooltip label={<HistoryTip text="Forward" path={forward} />} openDelay={400} fz="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          disabled={forward === undefined}
          onClick={() => void navigate(1)}
          aria-label="Forward"
        >
          {appIcons.forward}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

// "Back to <page>": the page is the last crumb of the path's routes, as the breadcrumb shows it (so a renamed board
// shows its new name); `/` is "Home". A path without a crumb gets only the text.
function HistoryTip({ text, path }: { text: string; path: string | undefined }): ReactNode {
  if (path === undefined) {
    return text;
  }

  if (path === '/') {
    return `${text} to Home`;
  }

  const match = matchRoutes(routes, path)?.findLast((candidate) => hasCrumb(candidate.route.handle));

  return match !== undefined && hasCrumb(match.route.handle)
    ? <>{text} to {match.route.handle.crumb(match.params)}</>
    : text;
}

// Where the current location is in the memory router's history (React Router does not tell): its entries (key and
// path), kept like the history itself: a push drops the entries after the current one and adds one, a replace changes
// the current one, a pop (Back, Forward) moves to the entry of its key. Gives the paths of the entries before and
// after the current one (`undefined` at either end).
function useHistoryPosition(): { back: string | undefined; forward: string | undefined } {
  const { key, pathname } = useLocation();
  const action = useNavigationType();
  const historyRef = useRef<{ entries: { key: string; path: string }[]; index: number }>({
    entries: [{ key, path: pathname }],
    index: 0,
  });
  const [position, setPosition] = useState<{ back: string | undefined; forward: string | undefined }>({
    back: undefined,
    forward: undefined,
  });

  useEffect(() => {
    const history = historyRef.current;
    const entry = { key, path: pathname };

    // Already there (the first render, or the effect run twice in development).
    if (history.entries[history.index]?.key !== key) {
      if (action === 'PUSH') {
        history.entries = [...history.entries.slice(0, history.index + 1), entry];
        history.index = history.entries.length - 1;
      } else if (action === 'REPLACE') {
        history.entries[history.index] = entry;
      } else {
        const index = history.entries.findIndex((candidate) => candidate.key === key);

        history.index = index === -1 ? history.index : index;
      }
    }

    setPosition({
      back: history.entries[history.index - 1]?.path,
      forward: history.entries[history.index + 1]?.path,
    });
  }, [key, pathname, action]);

  return position;
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

// The routes live in memory, and can be mirrored in the URL hash after a prefix: `#board-manager/boards/b1/meetings/m12`.
// So a reload (or a shared link) opens the same page. A hash with another start is left alone (the page's other tabs,
// `ui.ts`, or a host page's anchors). The route is written only while the element is shown (not inside `[hidden]`), and
// again when the demo page's tab is chosen.
function pathFromHash(prefix: string): string | undefined {
  const { hash } = location;

  return hash === prefix ? '/' : hash.startsWith(`${prefix}/`) ? hash.slice(prefix.length) : undefined;
}

// Without an element and a prefix (the `<board-manager>` element without `hash`), only the memory router.
function createAppRouter(
  element?: HTMLElement,
  hashPrefix?: string,
): { router: ReturnType<typeof createMemoryRouter>; dispose: () => void } {
  if (element === undefined || hashPrefix === undefined) {
    const router = createMemoryRouter(routes);

    return { router, dispose: () => router.dispose() };
  }

  const prefix = `#${hashPrefix}`;
  const router = createMemoryRouter(routes, { initialEntries: [pathFromHash(prefix) ?? '/'] });

  const writeHash = () => {
    if (element.closest('[hidden]') !== null) {
      return;
    }

    const path = router.state.location.pathname;
    const hash = path === '/' ? prefix : `${prefix}${path}`;

    if (location.hash !== hash) {
      history.replaceState(null, '', `${location.pathname}${location.search}${hash}`);
    }
  };

  const readHash = () => {
    const path = pathFromHash(prefix);

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
