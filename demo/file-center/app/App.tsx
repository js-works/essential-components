import { ActionIcon, Anchor, Breadcrumbs, Group, Menu, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import {
  createMemoryRouter,
  Link,
  Navigate,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from 'react-router';
import type { RouteObject } from 'react-router';
import { ancestorsOf, ROOT_ID } from '../domain';
import { browserKeys, FolderPage, folderPath, FolderTree, useBrowserService } from '../features/browser';
import { FavoritesPage } from '../features/favorites';
import { OverviewPage } from '../features/home';
import { RecentPage } from '../features/recent';
import { TrashPage } from '../features/trash';
import { appIcons } from '../shared/ui/icons';
import { mirrorInHash, pathFromHash } from './hashHistory';

export { createAppRouter };

// The app: an app header (the app icon, the title, the modules as tabs, Back and Forward; the breadcrumb below them), then
// the page of the module. The modules (2026-10-08, the user's wish; one by one): the Overview (`/`, the start page),
// Files (the folder tree on the left, the open folder's contents on the right; the root `/files` ("Files"), a folder
// `/files/<id>`), Recent (`/recent`, the files of all folders, the last modified first), Favorites (`/favorites`),
// Trash (`/trash`).

const MODULES = [
  { path: '/files', label: 'Files', icon: appIcons.files },
  { path: '/recent', label: 'Recent', icon: appIcons.recent },
  { path: '/favorites', label: 'Favorites', icon: appIcons.favorites },
  { path: '/trash', label: 'Trash', icon: appIcons.trash },
] as const;

// The module of a path (none on the start page).
function moduleOf(path: string): (typeof MODULES)[number] | undefined {
  return MODULES.find((module) => path === module.path || path.startsWith(`${module.path}/`));
}

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <main className="file-center__main">
            <OverviewPage />
          </main>
        ),
      },
      {
        path: 'files',
        element: <FilesLayout />,
        children: [
          { index: true, element: <FolderPage /> },
          { path: ':folderId', element: <FolderPage /> },
        ],
      },
      {
        path: 'recent',
        element: (
          <main className="file-center__main">
            <RecentPage />
          </main>
        ),
      },
      {
        path: 'favorites',
        element: (
          <main className="file-center__main">
            <FavoritesPage />
          </main>
        ),
      },
      {
        path: 'trash',
        element: (
          <main className="file-center__main">
            <TrashPage />
          </main>
        ),
      },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

function useCurrentFolder(): string {
  return useParams()['folderId'] ?? ROOT_ID;
}

function Layout(): ReactElement {
  return (
    <div className="file-center__app">
      <AppHeader />
      <Outlet />
    </div>
  );
}

// The module "Files": the folder tree on the left, the open folder's contents on the right.
function FilesLayout(): ReactElement {
  const navigate = useNavigate();
  const current = useCurrentFolder();

  return (
    <div className="file-center__body">
      <nav className="file-center__side" aria-label="Folders">
        <FolderTree current={current} onOpen={(id) => void navigate(folderPath(id))} />
      </nav>
      <main className="file-center__main">
        <Outlet />
      </main>
    </div>
  );
}

// Two lines (2026-10-08, like the other apps): the app icon, the title, the modules as tabs (a menu when the bar is
// narrow), Back and Forward; below them the breadcrumb. The app icon is only an icon, not a link (the first crumb,
// "Home", leads to the start page).
function AppHeader(): ReactElement {
  const appIcon = (
    <ThemeIcon variant="filled" size="lg" radius="sm" aria-hidden>
      {appIcons.app}
    </ThemeIcon>
  );

  return (
    <header className="file-center__app-header">
      <div className="file-center__app-header-row">
        <Group gap="xs" wrap="nowrap" flex="none">
          <span className="file-center__app-icon">{appIcon}</span>
          <Text fw={700} size="md" className="file-center__title">File Center</Text>
        </Group>
        <ModuleTabs />
        <ModuleMenu />
        <HistoryButtons />
      </div>
      <Crumbs />
    </header>
  );
}

// The modules, as tabs: the one of the current page is marked (also on its folders' pages).
function ModuleTabs(): ReactElement {
  return (
    <nav className="file-center__modules" aria-label="File Center: modules">
      <NavLink to="/" end className="file-center__module">Overview</NavLink>
      {MODULES.map((module) => (
        <NavLink key={module.path} to={module.path} className="file-center__module">{module.label}</NavLink>
      ))}
    </nav>
  );
}

// The tabs as a menu, while the app header is too narrow for them (CSS): the current module and a chevron.
function ModuleMenu(): ReactElement {
  const { pathname } = useLocation();
  const current = moduleOf(pathname);

  return (
    <Menu position="bottom-start" shadow="md" width={200}>
      <Menu.Target>
        <UnstyledButton className="file-center__module-menu" aria-label="File Center: modules">
          <Group gap={4} wrap="nowrap">
            <Text size="sm" fw={500}>{current?.label ?? 'Overview'}</Text>
            {appIcons.chevronDown}
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} to="/" leftSection={appIcons.home}>Overview</Menu.Item>
        <Menu.Divider />
        {MODULES.map((module) => (
          <Menu.Item key={module.path} component={Link} to={module.path} leftSection={module.icon}>
            {module.label}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

// "Home" (with a house icon: the start page), then the module and, in Files, one crumb per folder below the root; the
// last one is the current page (not a link). On the start page only "Home", the current page.
function Crumbs(): ReactElement | null {
  const service = useBrowserService();
  const current = useCurrentFolder();
  const { pathname } = useLocation();
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });

  if (pathname === '/') {
    return (
      <Breadcrumbs separator="›" separatorMargin={6} className="file-center__crumbs">
        <span className="file-center__home" aria-current="page">
          {appIcons.home}
          <span>Home</span>
        </span>
      </Breadcrumbs>
    );
  }

  const module = moduleOf(pathname);
  const crumbs = module === undefined
    ? []
    : module.path === '/files'
    ? [
      { to: folderPath(ROOT_ID), label: 'Files' },
      ...ancestorsOf(folders, current).slice(1).map((folder) => ({ to: folderPath(folder.id), label: folder.name })),
    ]
    : [{ to: module.path, label: module.label }];

  return (
    <Breadcrumbs separator="›" separatorMargin={6} className="file-center__crumbs">
      <Anchor component={Link} to="/" className="file-center__home">
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

// Back and Forward through the app's own history (the routes live in memory; the browser's history follows it), with
// tooltips that say where they go ("Back to Logos").
function HistoryButtons(): ReactElement {
  const navigate = useNavigate();
  const { back, forward } = useHistoryPosition();
  const service = useBrowserService();
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const nameOf = (path: string | undefined) => {
    if (path === undefined) {
      return undefined;
    }

    if (path === '/') {
      return 'Overview';
    }

    const module = moduleOf(path);

    if (module?.path !== '/files') {
      return module?.label;
    }

    const id = path === '/files' ? ROOT_ID : decodeURIComponent(path.replace(/^\/files\//, ''));

    return folders.find((folder) => folder.id === id)?.name;
  };
  const tip = (text: string, path: string | undefined) => {
    const name = nameOf(path);

    return name === undefined ? text : `${text} to ${name}`;
  };

  return (
    <Group gap={4} ml="auto" wrap="nowrap" className="file-center__history">
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

// The routes live in memory and are mirrored in the URL hash after a prefix: `#file-center/files/logos`, so a
// reload (or a shared link) opens the same folder; the browser's Back and Forward step through them (`hashHistory.ts`).
function createAppRouter(
  element: HTMLElement,
  hashPrefix: string,
): { router: ReturnType<typeof createMemoryRouter>; dispose: () => void } {
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
