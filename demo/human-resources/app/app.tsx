import { Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router';

import { MicroAppHeader, mirrorInHash, pathFromHash } from '@local/micro-app';

import type { HrData } from '../domain/index.js';
import { ChecklistPage, ChecklistsPage } from '../features/checklists/index.js';
import { DepartmentsPage } from '../features/departments/index.js';
import { EmployeePage, EmployeesPage } from '../features/employees/index.js';
import { OverviewPage } from '../features/home/index.js';
import { employeeOf, useHrData } from '../features/hr/index.js';
import { OpeningPage, RecruitingPage } from '../features/recruiting/index.js';
import { useViewerId } from '../features/viewer/index.js';
import type { TextKey, Translate } from '../shared/lib/i18n/index.js';
import { useTranslate } from '../shared/lib/i18n/index.js';
import { appIcons } from '../shared/ui/icons.js';
import { EmployeeAvatar } from '../shared/ui/parts.js';

export { createAppRouter };

const MODULES: readonly { to: string; label: TextKey }[] = [
  { to: '/employees', label: 'nav.employees' },
  { to: '/departments', label: 'nav.departments' },
  { to: '/recruiting', label: 'nav.recruiting' },
  { to: '/onboarding', label: 'nav.checklists' },
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

// A crumb of a module: its name in the current language.
function TextCrumb({ label }: { label: TextKey }) {
  return useTranslate()(label);
}

// The name of a module's record in the breadcrumb (the id while the data loads or for one that is gone).
function RecordCrumb({ module, id }: { module: string; id: string }) {
  const t = useTranslate();
  const data = useHrData();

  return (data === undefined ? undefined : recordName(t, data, module, id)) ?? id;
}

function UserMenu() {
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
        <Menu.Item
          renderRoot={(props) => <Link to="/employees/$employeeId" params={{ employeeId: viewerId }} {...props} />}
          leftSection={appIcons.user}
        >
          {t('shell.myProfile')}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

function Layout() {
  const t = useTranslate();
  const modules = [
    { to: '/', label: t('nav.overview'), exact: true },
    ...MODULES.map((module) => ({ to: module.to, label: t(module.label) })),
  ];

  return (
    <div className="human-resources__app">
      <MicroAppHeader icon={appIcons.app} title={t('shell.appName')} modules={modules} actions={<UserMenu />} />
      <main className="human-resources__main">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: OverviewPage });

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: OverviewPage });

const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees',
  staticData: { crumb: () => <TextCrumb label="nav.employees" /> },
});
const employeeListRoute = createRoute({ getParentRoute: () => employeesRoute, path: '/', component: EmployeesPage });
const employeeRoute = createRoute({
  getParentRoute: () => employeesRoute,
  path: '$employeeId',
  staticData: { crumb: (params) => <RecordCrumb module="employees" id={params['employeeId'] ?? ''} /> },
  component: EmployeePage,
});

const departmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/departments',
  staticData: { crumb: () => <TextCrumb label="nav.departments" /> },
  component: DepartmentsPage,
});

const recruitingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recruiting',
  staticData: { crumb: () => <TextCrumb label="nav.recruiting" /> },
});
const openingListRoute = createRoute({ getParentRoute: () => recruitingRoute, path: '/', component: RecruitingPage });
const openingRoute = createRoute({
  getParentRoute: () => recruitingRoute,
  path: '$openingId',
  staticData: { crumb: (params) => <RecordCrumb module="recruiting" id={params['openingId'] ?? ''} /> },
  component: OpeningPage,
});

const checklistsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  staticData: { crumb: () => <TextCrumb label="nav.checklists" /> },
});
const checklistListRoute = createRoute({ getParentRoute: () => checklistsRoute, path: '/', component: ChecklistsPage });
const checklistRoute = createRoute({
  getParentRoute: () => checklistsRoute,
  path: '$checklistId',
  staticData: { crumb: (params) => <RecordCrumb module="onboarding" id={params['checklistId'] ?? ''} /> },
  component: ChecklistPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  employeesRoute.addChildren([employeeListRoute, employeeRoute]),
  departmentsRoute,
  recruitingRoute.addChildren([openingListRoute, openingRoute]),
  checklistsRoute.addChildren([checklistListRoute, checklistRoute]),
]);

const createHumanResourcesRouter = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

// The routes live in memory and are mirrored in the URL hash after a prefix: `#human-resources/employees/e3`, so a
// reload (or a shared link) opens the same page; the browser's Back and Forward step through them.
function createAppRouter(element: HTMLElement, hashPrefix: string) {
  const prefix = `#${hashPrefix}`;
  const router = createHumanResourcesRouter(pathFromHash(prefix) ?? '/');

  return { router, dispose: mirrorInHash(router, element, prefix) };
}
