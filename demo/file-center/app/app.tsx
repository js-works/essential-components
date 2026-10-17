import { useQuery } from '@tanstack/react-query';
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  useNavigate,
  useParams,
  useRouterState,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';

import type { MicroAppCrumbItem } from '@local/micro-app';
import { MicroAppHeader, mirrorInHash, pathFromHash } from '@local/micro-app';

import { ancestorsOf, ROOT_ID } from '../domain/index.js';
import { browserKeys, FolderPage, FolderTree, folderLink, useBrowserService } from '../features/browser/index.js';
import { FavoritesPage } from '../features/favorites/index.js';
import { OverviewPage } from '../features/home/index.js';
import { RecentPage } from '../features/recent/index.js';
import { TrashPage } from '../features/trash/index.js';
import { appIcons } from '../shared/ui/icons.js';

export { createAppRouter };

const MODULES = [
  { to: '/', label: 'Overview', exact: true },
  { to: '/files', label: 'Files' },
  { to: '/recent', label: 'Recent' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/trash', label: 'Trash' },
];

function useFolders() {
  const service = useBrowserService();
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });

  return folders;
}

function useCurrentFolder(): string {
  return useParams({ strict: false }).folderId ?? ROOT_ID;
}

// The name of a folder (its id while the folders load or for one that is gone).
function FolderName({ id }: { id: string }) {
  return useFolders().find((folder) => folder.id === id)?.name ?? id;
}

// In Files, the breadcrumb is the open folder's path ("Files", then every folder below the root); elsewhere the
// routes' crumbs.
function useFolderCrumbs(): readonly MicroAppCrumbItem[] | undefined {
  const folders = useFolders();
  const current = useCurrentFolder();
  const inFiles = useRouterState({ select: (state) => state.matches.some((match) => match.routeId === '/files') });

  if (!inFiles) {
    return undefined;
  }

  return [
    { to: '/files', label: 'Files' },
    ...ancestorsOf(folders, current).slice(1).map((folder) => ({
      to: `/files/${folder.id}`,
      label: folder.name,
    })),
  ];
}

function Layout() {
  return (
    <div className="file-center__app">
      <MicroAppHeader icon={appIcons.app} title="File Center" modules={MODULES} crumbs={useFolderCrumbs()} />
      <Outlet />
    </div>
  );
}

function Main({ children }: { children: ReactNode }) {
  return <main className="file-center__main">{children}</main>;
}

function Overview() {
  return (
    <Main>
      <OverviewPage />
    </Main>
  );
}

// The module "Files": the folder tree on the left, the open folder's contents on the right.
function FilesLayout() {
  const navigate = useNavigate();
  const current = useCurrentFolder();

  return (
    <div className="file-center__body">
      <nav className="file-center__side" aria-label="Folders">
        <FolderTree current={current} onOpen={(id) => void navigate(folderLink(id))} />
      </nav>
      <Main>
        <Outlet />
      </Main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: Overview });

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: Overview });

const filesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/files',
  staticData: { crumb: () => 'Files' },
  component: FilesLayout,
});
const rootFolderRoute = createRoute({ getParentRoute: () => filesRoute, path: '/', component: FolderPage });
const folderRoute = createRoute({
  getParentRoute: () => filesRoute,
  path: '$folderId',
  staticData: { crumb: (params) => <FolderName id={params['folderId'] ?? ''} /> },
  component: FolderPage,
});

const recentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recent',
  staticData: { crumb: () => 'Recent' },
  component: () => (
    <Main>
      <RecentPage />
    </Main>
  ),
});
const favoritesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/favorites',
  staticData: { crumb: () => 'Favorites' },
  component: () => (
    <Main>
      <FavoritesPage />
    </Main>
  ),
});
const trashRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/trash',
  staticData: { crumb: () => 'Trash' },
  component: () => (
    <Main>
      <TrashPage />
    </Main>
  ),
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  filesRoute.addChildren([rootFolderRoute, folderRoute]),
  recentRoute,
  favoritesRoute,
  trashRoute,
]);

const createFileCenterRouter = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

// The routes live in memory and are mirrored in the URL hash after a prefix: `#file-center/files/logos`, so a reload
// (or a shared link) opens the same folder; the browser's Back and Forward step through them.
function createAppRouter(element: HTMLElement, hashPrefix: string) {
  const prefix = `#${hashPrefix}`;
  const router = createFileCenterRouter(pathFromHash(prefix) ?? '/');
  const stopMirror = mirrorInHash(router, element, prefix);

  return { router, dispose: stopMirror };
}
