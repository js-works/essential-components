import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';

import { MicroAppHeader, mirrorInHash, pathFromHash } from '@local/micro-app';

import { AccessPage, CheckAccessPage } from '../features/access/index.js';
import { GroupPage, GroupsPage } from '../features/groups/index.js';
import { HomePage } from '../features/home/index.js';
import { useAccessData } from '../features/iam/index.js';
import { PermissionsPage, RolePage, RolesPage } from '../features/roles/index.js';
import { UserPage, UsersPage } from '../features/users/index.js';
import { appIcons } from '../shared/ui/icons.js';

export { createAppRouter };

const MODULES = [
  { to: '/', label: 'Overview', exact: true },
  { to: '/users', label: 'Users' },
  { to: '/groups', label: 'Groups' },
  { to: '/roles', label: 'Roles' },
  { to: '/access', label: 'Access' },
  { to: '/check', label: 'Check access' },
  { to: '/permissions', label: 'Permissions' },
];

// The name of a user, group or role in the breadcrumb (its id while the data loads or for one that is gone).
function NameCrumb({ kind, id }: { kind: 'users' | 'groups' | 'roles'; id: string }) {
  const data = useAccessData();
  const items: readonly { id: string; name: string }[] = data?.[kind] ?? [];

  return items.find((item) => item.id === id)?.name ?? id;
}

function Layout() {
  return (
    <div className="user-manager__app">
      <MicroAppHeader icon={appIcons.app} title="User Manager" modules={MODULES} />
      <main className="user-manager__main">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: HomePage });

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  staticData: { crumb: () => 'Users' },
});
const userListRoute = createRoute({ getParentRoute: () => usersRoute, path: '/', component: UsersPage });
const userRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '$userId',
  staticData: { crumb: (params) => <NameCrumb kind="users" id={params['userId'] ?? ''} /> },
  component: UserPage,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups',
  staticData: { crumb: () => 'Groups' },
});
const groupListRoute = createRoute({ getParentRoute: () => groupsRoute, path: '/', component: GroupsPage });
const groupRoute = createRoute({
  getParentRoute: () => groupsRoute,
  path: '$groupId',
  staticData: { crumb: (params) => <NameCrumb kind="groups" id={params['groupId'] ?? ''} /> },
  component: GroupPage,
});

const rolesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/roles',
  staticData: { crumb: () => 'Roles' },
});
const roleListRoute = createRoute({ getParentRoute: () => rolesRoute, path: '/', component: RolesPage });
const roleRoute = createRoute({
  getParentRoute: () => rolesRoute,
  path: '$roleId',
  staticData: { crumb: (params) => <NameCrumb kind="roles" id={params['roleId'] ?? ''} /> },
  component: RolePage,
});

const accessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/access',
  staticData: { crumb: () => 'Access' },
  component: AccessPage,
});
const checkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/check',
  staticData: { crumb: () => 'Check access' },
  component: CheckAccessPage,
});
const permissionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/permissions',
  staticData: { crumb: () => 'Permissions' },
  component: PermissionsPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  usersRoute.addChildren([userListRoute, userRoute]),
  groupsRoute.addChildren([groupListRoute, groupRoute]),
  rolesRoute.addChildren([roleListRoute, roleRoute]),
  accessRoute,
  checkRoute,
  permissionsRoute,
]);

const createUserManagerRouter = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

// The routes live in memory and are mirrored in the URL hash after a prefix: `#user-manager/users/u3`, so a reload (or
// a shared link) opens the same page; the browser's Back and Forward step through them.
function createAppRouter(element: HTMLElement, hashPrefix: string) {
  const prefix = `#${hashPrefix}`;
  const router = createUserManagerRouter(pathFromHash(prefix) ?? '/');
  const stopMirror = mirrorInHash(router, element, prefix);

  return { router, dispose: stopMirror };
}
