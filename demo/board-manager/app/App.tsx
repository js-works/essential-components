import { ActionIcon, Anchor, Breadcrumbs, Group, Menu, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import {
  createMemoryRouter,
  Link,
  matchRoutes,
  NavLink,
  Outlet,
  useLocation,
  useMatches,
  useNavigate,
  useNavigationType,
} from 'react-router';
import type { Params, RouteObject } from 'react-router';
import { BoardPage } from '../features/boards/pages/BoardPage';
import { BoardsPage } from '../features/boards/pages/BoardsPage';
import { HomePage } from '../features/home/pages/HomePage';
import { MeetingPage } from '../features/meetings/pages/MeetingPage';
import { MeetingsPage } from '../features/meetings/pages/MeetingsPage';
import { MemberPage } from '../features/members/pages/MemberPage';
import { MembersPage } from '../features/members/pages/MembersPage';
import { OrganizationPage } from '../features/organizations/pages/OrganizationPage';
import { OrganizationsPage } from '../features/organizations/pages/OrganizationsPage';
import { getBoard, getMeeting, getOrganization, getPerson } from '../infra/in-memory';
import { i18n, useTranslate } from '../shared/lib/i18n';
import type { Translate } from '../shared/lib/i18n';
import { appIcons, useDb } from '../shared/shared';
import { NotFound } from '../shared/ui/NotFound';
import { mirrorInHash, pathFromHash } from './hashHistory';

export { createAppRouter };

// The app: an app header (the app icon, the title, the modules as tabs; the breadcrumb below them) and the page of the route.
// No side navigation: the app is embedded in a page with content around it (later e.g. XWiki), where there is little
// horizontal space.

const MODULES = [
  { path: '/boards', label: 'modules.boards', icon: appIcons.boards },
  { path: '/meetings', label: 'modules.meetings', icon: appIcons.meetings },
  { path: '/members', label: 'modules.members', icon: appIcons.members },
  { path: '/organizations', label: 'modules.organizations', icon: appIcons.organizations },
] as const;

// A route with a crumb in the breadcrumb (its `handle`): the crumb gets the translation, it is made where the
// breadcrumb or a tooltip is rendered, which renders again when the language changes.
type Crumb = { crumb: (params: Params, t: Translate) => ReactNode };

function hasCrumb(handle: unknown): handle is Crumb {
  return typeof handle === 'object' && handle !== null && 'crumb' in handle;
}

function BoardCrumb({ id }: { id: string | undefined }): ReactNode {
  const t = useTranslate();

  return useDb((state) => getBoard(state, id)?.name) ?? t('entities.board');
}

function MemberCrumb({ id }: { id: string | undefined }): ReactNode {
  const t = useTranslate();

  return useDb((state) => getPerson(state, id)?.name) ?? t('entities.member');
}

function OrganizationCrumb({ id }: { id: string | undefined }): ReactNode {
  const t = useTranslate();

  return useDb((state) => getOrganization(state, id)?.name) ?? t('entities.organization');
}

function MeetingCrumb({ id }: { id: string | undefined }): ReactNode {
  const t = useTranslate();

  return useDb((state) => getMeeting(state, id)?.title) ?? t('entities.meeting');
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
        handle: { crumb: (_params, t) => t('modules.boards') } satisfies Crumb,
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
        handle: { crumb: (_params, t) => t('modules.meetings') } satisfies Crumb,
        children: [{ index: true, element: <MeetingsPage /> }, meetingRoute()],
      },
      {
        path: 'members',
        handle: { crumb: (_params, t) => t('modules.members') } satisfies Crumb,
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
        handle: { crumb: (_params, t) => t('modules.organizations') } satisfies Crumb,
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
      <AppHeader />
      <main className="board-manager__main">
        <Outlet />
      </main>
    </div>
  );
}

// Two lines (2026-10-08, the Human Resources' trial, rolled out): the app icon, the title, the modules as tabs (a menu
// when the bar is narrow), Back and Forward; below them the breadcrumb. The app icon is only an icon, not a link (the
// first crumb, "Home", leads to the start page).
function AppHeader(): ReactElement {
  const t = useTranslate();
  const appIcon = (
    <ThemeIcon variant="filled" size="lg" radius="sm" aria-hidden>
      {appIcons.app}
    </ThemeIcon>
  );

  return (
    <header className="board-manager__app-header">
      <div className="board-manager__app-header-row">
        <Group gap="xs" wrap="nowrap" flex="none">
          <span className="board-manager__app-icon">{appIcon}</span>
          <Text fw={700} size="md" className="board-manager__title">{t('shell.appName')}</Text>
        </Group>
        <ModuleTabs />
        <ModuleMenu />
        <HistoryButtons />
      </div>
      <Crumbs />
    </header>
  );
}

// The start page and the modules, as tabs: the one of the current page is marked (also on its records' pages).
function ModuleTabs(): ReactElement {
  const t = useTranslate();

  return (
    <nav className="board-manager__modules" aria-label={t('shell.modulesMenu', { app: t('shell.appName') })}>
      <NavLink to="/" end className="board-manager__module">{t('shell.overview')}</NavLink>
      {MODULES.map((module) => (
        <NavLink key={module.path} to={module.path} className="board-manager__module">
          {t(module.label)}
        </NavLink>
      ))}
    </nav>
  );
}

// The tabs as a menu, while the app header is too narrow for them (CSS): the current module and a chevron.
function ModuleMenu(): ReactElement {
  const t = useTranslate();
  const { pathname } = useLocation();
  const current = MODULES.find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`));

  return (
    <Menu position="bottom-start" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton
          className="board-manager__module-menu"
          aria-label={t('shell.modulesMenu', { app: t('shell.appName') })}
        >
          <Group gap={4} wrap="nowrap">
            <Text size="sm" fw={500}>{current === undefined ? t('shell.overview') : t(current.label)}</Text>
            {appIcons.chevronDown}
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} to="/" leftSection={appIcons.home}>{t('shell.overview')}</Menu.Item>
        <Menu.Divider />
        {MODULES.map((module) => (
          <Menu.Item key={module.path} component={Link} to={module.path} leftSection={module.icon}>
            {t(module.label)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

// Back and Forward through the app's own history, like the browser's buttons: the routes live in memory, and the
// browser's history follows them while they are mirrored in the hash (`hashHistory.ts`). Their tooltips say where they
// go ("Back to Boards").
function HistoryButtons(): ReactElement {
  const t = useTranslate();
  const navigate = useNavigate();
  const { back, forward } = useHistoryPosition();

  return (
    <Group gap={4} ml="auto" wrap="nowrap" className="board-manager__history">
      <Tooltip label={<HistoryTip direction="back" path={back} />} openDelay={400} fz="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          disabled={back === undefined}
          onClick={() => void navigate(-1)}
          aria-label={t('shell.back')}
        >
          {appIcons.back}
        </ActionIcon>
      </Tooltip>
      <Tooltip label={<HistoryTip direction="forward" path={forward} />} openDelay={400} fz="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          disabled={forward === undefined}
          onClick={() => void navigate(1)}
          aria-label={t('shell.forward')}
        >
          {appIcons.forward}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}

// "Back to <page>": the page is the last crumb of the path's routes, as the breadcrumb shows it (so a renamed board
// shows its new name); `/` is "Overview". A path without a crumb gets only the text.
function HistoryTip({ direction, path }: { direction: 'back' | 'forward'; path: string | undefined }): ReactNode {
  const t = useTranslate();
  const text = t(direction === 'back' ? 'shell.back' : 'shell.forward');

  if (path === undefined) {
    return text;
  }

  if (path === '/') {
    return t(direction === 'back' ? 'shell.backToOverview' : 'shell.forwardToOverview');
  }

  const match = matchRoutes(routes, path)?.findLast((candidate) => hasCrumb(candidate.route.handle));

  // The page is an element (a crumb may read the store): a placeholder `<page/>` of the text.
  return match !== undefined && hasCrumb(match.route.handle)
    ? (
      <Trans
        i18n={i18n}
        t={t}
        i18nKey={direction === 'back' ? 'shell.backTo' : 'shell.forwardTo'}
        components={{ page: <>{match.route.handle.crumb(match.params, t)}</> }}
      />
    )
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
// page (not a link). On the start page, Home is the current page itself.
function Crumbs(): ReactElement | null {
  const t = useTranslate();
  const matches = useMatches().filter((match) => hasCrumb(match.handle));
  const atHome = useLocation().pathname === '/';

  // On the start page, "Home" is the current page: not a link.
  if (atHome) {
    return (
      <Breadcrumbs separator="›" separatorMargin={6} className="board-manager__crumbs">
        <span className="board-manager__home" aria-current="page">
          {appIcons.home}
          <span>{t('shell.home')}</span>
        </span>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs separator="›" separatorMargin={6} className="board-manager__crumbs">
      <Anchor component={Link} to="/" className="board-manager__home">
        {appIcons.home}
        <span>{t('shell.home')}</span>
      </Anchor>
      {matches.map((match, index) => {
        const crumb = hasCrumb(match.handle) ? match.handle.crumb(match.params, t) : null;

        return index === matches.length - 1
          ? <Text key={match.id} size="sm" fw={500} aria-current="page">{crumb}</Text>
          : <Anchor key={match.id} component={Link} to={match.pathname} size="sm">{crumb}</Anchor>;
      })}
    </Breadcrumbs>
  );
}

// The routes live in memory, and can be mirrored in the URL hash after a prefix: `#board-manager/boards/b1/meetings/m12`.
// So a reload (or a shared link) opens the same page, and the browser's Back and Forward step through them
// (`hashHistory.ts`). A hash with another start is left alone (the page's other tabs, `ui.ts`, or a host page's anchors).
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
  const stopMirror = mirrorInHash(router, element, prefix);

  return {
    router,
    dispose: () => {
      stopMirror();
      router.dispose();
    },
  };
}
