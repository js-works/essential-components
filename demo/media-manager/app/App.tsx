import { ActionIcon, Anchor, Breadcrumbs, Group, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { createMemoryRouter, Link, Outlet, useLocation, useNavigate, useNavigationType, useParams } from 'react-router';
import type { RouteObject } from 'react-router';
import { ancestorsOf, ROOT_ID } from '../domain';
import { browserKeys, FolderPage, folderPath, FolderTree, useBrowserService } from '../features/browser';
import { appIcons } from '../shared/ui/icons';

export { createAppRouter };

// The app: a top bar (the app icon, the title, the open folder's path as a breadcrumb, Back and Forward), then the
// folder tree on the left and the open folder's contents on the right. Each folder has a route: `/` (all files) or
// `/folders/<id>`.

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <FolderPage /> },
      { path: 'folders/:folderId', element: <FolderPage /> },
      { path: '*', element: <FolderPage /> },
    ],
  },
];

function useCurrentFolder(): string {
  return useParams()['folderId'] ?? ROOT_ID;
}

function Layout(): ReactElement {
  const navigate = useNavigate();
  const current = useCurrentFolder();

  return (
    <div className="media-manager__app">
      <TopBar />
      <div className="media-manager__body">
        <nav className="media-manager__side" aria-label="Folders">
          <FolderTree current={current} onOpen={(id) => void navigate(folderPath(id))} />
        </nav>
        <main className="media-manager__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

// The app icon is a link to the start page, but not on the start page itself.
function TopBar(): ReactElement {
  const atHome = useLocation().pathname === '/';
  const appIcon = (
    <ThemeIcon variant="filled" size="lg" radius="sm" aria-hidden>
      {appIcons.app}
    </ThemeIcon>
  );

  return (
    <header className="media-manager__top-bar">
      <Group gap="xs" wrap="nowrap" flex="none">
        {atHome
          ? <span className="media-manager__app-icon">{appIcon}</span>
          : (
            <Link to="/" className="media-manager__app-icon" aria-label="Overview">
              {appIcon}
            </Link>
          )}
        <Text fw={700} size="md" className="media-manager__title">Media Manager</Text>
      </Group>
      <Crumbs />
      <HistoryButtons />
    </header>
  );
}

// The open folder's path: "All files" (with a folder icon), then one crumb per folder; the last one is the open
// folder itself (not a link).
function Crumbs(): ReactElement | null {
  const service = useBrowserService();
  const current = useCurrentFolder();
  const { data: folders = [] } = useQuery({
    queryKey: browserKeys.folders(),
    queryFn: ({ signal }) => service.folders(signal),
  });
  const path = ancestorsOf(folders, current).slice(1);
  const atRoot = path.length === 0;

  // On the start page, no breadcrumb: it would only be the house of the page itself.
  if (atRoot) {
    return null;
  }

  return (
    <Breadcrumbs separator="›" separatorMargin={6} className="media-manager__crumbs">
      <Anchor component={Link} to="/" className="media-manager__home" aria-label="Overview">
        {appIcons.home}
      </Anchor>
      {path.map((folder, index) =>
        index === path.length - 1
          ? <Text key={folder.id} size="sm" fw={500} aria-current="page">{folder.name}</Text>
          : <Anchor key={folder.id} component={Link} to={folderPath(folder.id)} size="sm">{folder.name}</Anchor>
      )}
    </Breadcrumbs>
  );
}

// Back and Forward through the app's own history (the routes live in memory; the hash only mirrors them), with
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

    const id = path === '/' ? ROOT_ID : decodeURIComponent(path.replace(/^\/folders\//, ''));

    return folders.find((folder) => folder.id === id)?.name;
  };
  const tip = (text: string, path: string | undefined) => {
    const name = nameOf(path);

    return name === undefined ? text : `${text} to ${name}`;
  };

  return (
    <Group gap={4} ml="auto" wrap="nowrap" className="media-manager__history">
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

// The routes live in memory and are mirrored in the URL hash after a prefix: `#media-manager/folders/logos`, so a
// reload (or a shared link) opens the same folder. A hash with another start is left alone. The route is written only
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
