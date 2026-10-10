import { ActionIcon, Anchor, Breadcrumbs, Group, Menu, Text, ThemeIcon, Tooltip, UnstyledButton } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { createMemoryRouter, Link, NavLink, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router';
import type { RouteObject } from 'react-router';
import type { HrData } from '../domain';
import { ChecklistPage, ChecklistsPage } from '../features/checklists';
import { DepartmentsPage } from '../features/departments';
import { EmployeePage, EmployeesPage } from '../features/employees';
import { OverviewPage } from '../features/home';
import { employeeOf, useHrData } from '../features/hr';
import { OpeningPage, RecruitingPage } from '../features/recruiting';
import { useViewerId } from '../features/viewer';
import { useTranslate } from '../shared/lib/i18n';
import type { TextKey, Translate } from '../shared/lib/i18n';
import { appIcons } from '../shared/ui/icons';
import { EmployeeAvatar } from '../shared/ui/parts';
import { mirrorInHash, pathFromHash } from './hashHistory';

export { createAppRouter };

// The app: an app header (the app icon, the title, the modules as tabs, the user, Back and Forward; the breadcrumb below
// them), then the page of the route.

const MODULES: readonly { path: string; label: TextKey; icon: ReactElement }[] = [
  { path: '/employees', label: 'nav.employees', icon: appIcons.employees },
  { path: '/departments', label: 'nav.departments', icon: appIcons.departments },
  { path: '/recruiting', label: 'nav.recruiting', icon: appIcons.recruiting },
  { path: '/onboarding', label: 'nav.checklists', icon: appIcons.checklists },
];

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'employees', element: <EmployeesPage /> },
      { path: 'employees/:employeeId', element: <EmployeePage /> },
      { path: 'departments', element: <DepartmentsPage /> },
      { path: 'recruiting', element: <RecruitingPage /> },
      { path: 'recruiting/:openingId', element: <OpeningPage /> },
      { path: 'onboarding', element: <ChecklistsPage /> },
      { path: 'onboarding/:checklistId', element: <ChecklistPage /> },
      { path: '*', element: <OverviewPage /> },
    ],
  },
];

// The name of a module's record: an employee, an opening, a checklist (its employee and kind).
function recordName(t: Translate, data: HrData, module: string, id: string): string | undefined {
  switch (module) {
    case 'employees':
      return employeeOf(data, id)?.name;
    case 'recruiting':
      return data.openings.find((opening) => opening.id === id)?.title;
    case 'onboarding': {
      const checklist = data.checklists.find((candidate) => candidate.id === id);

      return checklist === undefined
        ? undefined
        : `${employeeOf(data, checklist.employeeId)?.name ?? ''} · ${t(`checklistKind.${checklist.kind}`)}`;
    }
    default:
      return undefined;
  }
}

// The crumbs of a path: the module, then its record by name.
function crumbsOf(t: Translate, data: HrData | undefined, path: string): { to: string; label: string }[] {
  const [module = '', id] = path.split('/').filter(Boolean);
  const found = MODULES.find((candidate) => candidate.path === `/${module}`);

  if (found === undefined) {
    return [];
  }

  const crumbs = [{ to: found.path, label: t(found.label) }];
  const name = id === undefined || data === undefined ? undefined : recordName(t, data, module, id);

  return id === undefined ? crumbs : [...crumbs, { to: path, label: name ?? id }];
}

function pageName(t: Translate, data: HrData | undefined, path: string): string {
  return path === '/' ? t('nav.overview') : crumbsOf(t, data, path).at(-1)?.label ?? path;
}

function Layout(): ReactElement {
  return (
    <div className="human-resources__app">
      <AppHeader />
      <main className="human-resources__main">
        <Outlet />
      </main>
    </div>
  );
}

// Two lines (2026-10-08, a trial: the modules as tabs, then rolled out to the other apps or reverted): the app icon,
// the title, the modules as tabs (a menu when the bar is narrow), the user, Back and Forward; below them the
// breadcrumb. The app icon is only an icon, not a link (the first crumb, "Home", leads to the start page).
function AppHeader(): ReactElement {
  const t = useTranslate();

  return (
    <header className="human-resources__app-header">
      <div className="human-resources__app-header-row">
        <Group gap="xs" wrap="nowrap" flex="none">
          <span className="human-resources__app-icon">
            <ThemeIcon variant="filled" size="lg" radius="sm" aria-hidden>
              {appIcons.app}
            </ThemeIcon>
          </span>
          <Text fw={700} size="md" className="human-resources__title">{t('shell.appName')}</Text>
        </Group>
        <ModuleTabs />
        <ModuleMenu />
        <Group gap="xs" ml="auto" wrap="nowrap" flex="none">
          <UserMenu />
          <HistoryButtons />
        </Group>
      </div>
      <Crumbs />
    </header>
  );
}

// The start page and the modules, as tabs: the one of the current page is marked (also on its records' pages).
function ModuleTabs(): ReactElement {
  const t = useTranslate();

  return (
    <nav className="human-resources__modules" aria-label={t('shell.modules')}>
      <NavLink to="/" end className="human-resources__module">{t('nav.overview')}</NavLink>
      {MODULES.map((module) => (
        <NavLink key={module.path} to={module.path} className="human-resources__module">
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
    <Menu position="bottom-start" shadow="md" width={220}>
      <Menu.Target>
        <UnstyledButton className="human-resources__module-menu" aria-label={t('shell.modules')}>
          <Group gap={4} wrap="nowrap">
            <Text size="sm" fw={500}>{t(current?.label ?? 'nav.overview')}</Text>
            {appIcons.chevronDown}
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item component={Link} to="/" leftSection={appIcons.home}>{t('nav.overview')}</Menu.Item>
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

// The signed-in user (an HR manager): their name and title, and their own page.
function UserMenu(): ReactElement {
  const t = useTranslate();
  const data = useHrData();
  const viewerId = useViewerId();
  const viewer = data === undefined ? undefined : employeeOf(data, viewerId);

  return (
    <Menu position="bottom-end" shadow="md" width={240}>
      <Menu.Target>
        <UnstyledButton className="human-resources__user" aria-label={t('shell.userMenu')}>
          <Group gap={6} wrap="nowrap">
            <EmployeeAvatar name={viewer?.name ?? ''} size={26} />
            <Text size="sm" c="dimmed" className="human-resources__user-title">{viewer?.title}</Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{viewer?.name}</Menu.Label>
        <Menu.Item component={Link} to={`/employees/${viewerId}`} leftSection={appIcons.user}>
          {t('shell.myProfile')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

// Home (a house icon, and the text as the link), then the module and its record; the last crumb is the current page
// (not a link).
function Crumbs(): ReactElement | null {
  const t = useTranslate();
  const { pathname } = useLocation();
  const data = useHrData();
  const crumbs = crumbsOf(t, data, pathname);

  // On the start page, "Home" is the current page: not a link.
  if (crumbs.length === 0) {
    return (
      <Breadcrumbs separator="›" separatorMargin={6} className="human-resources__crumbs">
        <span className="human-resources__home" aria-current="page">
          {appIcons.home}
          <span>{t('shell.home')}</span>
        </span>
      </Breadcrumbs>
    );
  }

  return (
    <Breadcrumbs separator="›" separatorMargin={6} className="human-resources__crumbs">
      <Anchor component={Link} to="/" className="human-resources__home">
        {appIcons.home}
        <span>{t('shell.home')}</span>
      </Anchor>
      {crumbs.map((crumb, index) =>
        index === crumbs.length - 1
          ? <Text key={crumb.to} size="sm" fw={500} aria-current="page">{crumb.label}</Text>
          : <Anchor key={crumb.to} component={Link} to={crumb.to} size="sm">{crumb.label}</Anchor>
      )}
    </Breadcrumbs>
  );
}

// Back and Forward through the app's own history (the routes live in memory; the browser's history follows it, see
// `hashHistory.ts`), with tooltips that say where they go ("Back to Employees").
function HistoryButtons(): ReactElement {
  const t = useTranslate();
  const navigate = useNavigate();
  const { back, forward } = useHistoryPosition();
  const data = useHrData();
  const tip = (key: 'shell.back' | 'shell.forward', path: string | undefined) =>
    path === undefined ? t(key) : t(`${key}To`, { page: pageName(t, data, path) });

  return (
    <Group gap={4} wrap="nowrap" className="human-resources__history">
      <Tooltip label={tip('shell.back', back)} openDelay={400} fz="xs">
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
      <Tooltip label={tip('shell.forward', forward)} openDelay={400} fz="xs">
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

// The routes live in memory and are mirrored in the URL hash after a prefix: `#human-resources/employees/e3`, so a
// reload (or a shared link) opens the same page; the browser's Back and Forward step through them (`hashHistory.ts`).
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
