import { ActionIcon, Anchor, Breadcrumbs, Group, Menu, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { createMemoryRouter, Link, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router';
import type { RouteObject } from 'react-router';
import type { AccessData } from '../domain';
import { AccessPage, CheckAccessPage } from '../features/access';
import { GroupPage, GroupsPage } from '../features/groups';
import { HomePage } from '../features/home';
import { useAccessData } from '../features/iam';
import { PermissionsPage, RolePage, RolesPage } from '../features/roles';
import { UserPage, UsersPage } from '../features/users';
import { appIcons } from '../shared/ui/icons';

export { createAppRouter };

// The app: a top bar (the app icon, the title with the menu of the modules, the breadcrumb, Back and Forward), then the
// page of the route. Like the Board Manager.

const MODULES = [
  { path: '/users', label: 'Users', icon: appIcons.users },
  { path: '/groups', label: 'Groups', icon: appIcons.groups },
  { path: '/roles', label: 'Roles', icon: appIcons.roles },
  { path: '/access', label: 'Access', icon: appIcons.access },
  { path: '/check', label: 'Check access', icon: appIcons.check },
  { path: '/permissions', label: 'Permissions', icon: appIcons.roles },
] as const;

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'users/:userId', element: <UserPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/:groupId', element: <GroupPage /> },
      { path: 'roles', element: <RolesPage /> },
      { path: 'roles/:roleId', element: <RolePage /> },
      { path: 'access', element: <AccessPage /> },
      { path: 'check', element: <CheckAccessPage /> },
      { path: 'permissions', element: <PermissionsPage /> },
      { path: '*', element: <HomePage /> },
    ],
  },
];

// The crumbs of a path: the module, then the user, group or role by name.
function crumbsOf(data: AccessData | undefined, path: string): { to: string; label: string }[] {
  const [module = '', id] = path.split('/').filter(Boolean);
  const found = MODULES.find((candidate) => candidate.path === `/${module}`);

  if (found === undefined) {
    return [];
  }

  const crumbs = [{ to: found.path, label: found.label }];
  const name = id === undefined || data === undefined
    ? undefined
    : module === 'users'
    ? data.users.find((user) => user.id === id)?.name
    : module === 'groups'
    ? data.groups.find((group) => group.id === id)?.name
    : module === 'roles'
    ? data.roles.find((role) => role.id === id)?.name
    : undefined;

  return id === undefined ? crumbs : [...crumbs, { to: path, label: name ?? id }];
}

function pageName(data: AccessData, path: string): string {
  return path === '/' ? 'Main' : crumbsOf(data, path).at(-1)?.label ?? path;
}

function Layout(): ReactElement {
  return (
    <div className="user-manager__app">
      <TopBar />
      <main className="user-manager__main">
        <Outlet />
      </main>
    </div>
  );
}

// The app icon is only an icon, not a link (the first crumb, "Home", leads to the start page).
function TopBar(): ReactElement {
  const appIcon = (
    <ThemeIcon variant="filled" size="lg" radius="sm" aria-hidden>
      {appIcons.app}
    </ThemeIcon>
  );

  return (
    <header className="user-manager__top-bar">
      <Group gap="xs" wrap="nowrap" flex="none">
        <span className="user-manager__app-icon">{appIcon}</span>
        <Menu position="bottom-start" shadow="md" width={200}>
          <Menu.Target>
            <UnstyledButton className="user-manager__title" aria-label="User Manager: modules">
              <Group gap={4} wrap="nowrap">
                <Text fw={700} size="md">User Manager</Text>
                {appIcons.chevronDown}
              </Group>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component={Link} to="/" leftSection={appIcons.home}>Main</Menu.Item>
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

// Main (a neutral icon, and the text as the link), then the module and the user, group or role; the last crumb is the
// current page (not a link).
function Crumbs(): ReactElement | null {
  const { pathname } = useLocation();
  const data = useAccessData();
  const crumbs = crumbsOf(data, pathname);

  // On the start page, "Home" is the current page: not a link.
  if (crumbs.length === 0) {
    return (
      <Breadcrumbs separator="›" separatorMargin={6} className="user-manager__crumbs">
        <span className="user-manager__home" aria-current="page">
          {appIcons.home}
          <span>Home</span>
        </span>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs separator="›" separatorMargin={6} className="user-manager__crumbs">
      <Anchor component={Link} to="/" className="user-manager__home">
        {appIcons.home}
        <span>Home</span>
      </Anchor>
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1
          ? <Text key={crumb.to} size="sm" fw={500} aria-current="page">{crumb.label}</Text>
          : <Anchor key={crumb.to} component={Link} to={crumb.to} size="sm">{crumb.label}</Anchor>
      )}
    </Breadcrumbs>
  );
}

// Back and Forward through the app's own history (the routes live in memory; the hash only mirrors them), with
// tooltips that say where they go ("Back to Users").
function HistoryButtons(): ReactElement {
  const navigate = useNavigate();
  const { back, forward } = useHistoryPosition();
  const data = useAccessData();
  const tip = (text: string, path: string | undefined) => {
    const name = path === undefined || data === undefined ? undefined : pageName(data, path);

    return name === undefined ? text : `${text} to ${name}`;
  };

  return (
    <Group gap={4} ml="auto" wrap="nowrap" className="user-manager__history">
      <Tooltip label={tip('Back', back)} openDelay={400} fz="xs">
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
      <Tooltip label={tip('Forward', forward)} openDelay={400} fz="xs">
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

// Where the current location is in the memory router's history (React Router does not tell): its entries, kept like
// the history itself (a push drops the entries after the current one, a replace changes it, a pop moves to its key).
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

// The routes live in memory and are mirrored in the URL hash after a prefix: `#user-manager/users/u3`, so a
// reload (or a shared link) opens the same page. A hash with another start is left alone. The route is written only
// while the element is shown (not inside `[hidden]`), and again when it is shown (a cockpit's app or a tab panel).
function pathFromHash(prefix: string): string | undefined {
  const { hash } = location;

  return hash === prefix ? '/' : hash.startsWith(`${prefix}/`) ? hash.slice(prefix.length) : undefined;
}

function createAppRouter(
  element: HTMLElement,
  hashPrefix: string,
): { router: ReturnType<typeof createMemoryRouter>; dispose: () => void } {
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
  const observer = new MutationObserver(writeHash);
  const shown = element.closest('.ui-tabs__panel, [data-hash-segment]');

  if (shown !== null) {
    observer.observe(shown, { attributes: true, attributeFilter: ['hidden'] });
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
