import { Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { MicroAppHeader, mirrorInHash, pathFromHash } from '@local/micro-app';

import { ApprovalsPage } from '../features/approvals/index.js';
import { CalendarPage } from '../features/calendar/index.js';
import { ClockPage } from '../features/clock/index.js';
import { EmployeePage, EmployeesPage } from '../features/employees/index.js';
import { OverviewPage } from '../features/home/index.js';
import { LeavePage } from '../features/leave/index.js';
import { SickPage } from '../features/sick/index.js';
import { TimesheetPage } from '../features/timesheet/index.js';
import { useTimeData } from '../features/tracker/index.js';
import { useViewer } from '../features/viewer/index.js';
import type { TextKey } from '../shared/lib/i18n/index.js';
import { useTranslate } from '../shared/lib/i18n/index.js';
import { appIcons } from '../shared/ui/icons.js';
import { EmployeeAvatar } from '../shared/ui/parts.js';

export { createAppRouter };

const MODULES: readonly { to: string; label: TextKey; lead?: true }[] = [
  { to: '/clock', label: 'nav.clock' },
  { to: '/timesheet', label: 'nav.timesheet' },
  { to: '/leave', label: 'nav.leave' },
  { to: '/sick', label: 'nav.sick' },
  { to: '/calendar', label: 'nav.calendar' },
  { to: '/approvals', label: 'nav.approvals', lead: true },
  { to: '/employees', label: 'nav.employees', lead: true },
];

// A crumb of a module: its name in the current language.
function TextCrumb({ label }: { label: TextKey }) {
  return useTranslate()(label);
}

// The name of an employee in the breadcrumb (the id while the data loads or for one that is gone).
function EmployeeCrumb({ id }: { id: string }) {
  return useTimeData()?.employees.find((employee) => employee.id === id)?.name ?? id;
}

function UserMenu() {
  const t = useTranslate();
  const data = useTimeData();
  const { employeeId, role, setRole } = useViewer();
  const name = data?.employees.find((employee) => employee.id === employeeId)?.name ?? '';

  return (
    <Menu position="bottom-end" shadow="md" width={240}>
      <Menu.Target>
        <UnstyledButton className="time-tracker__user" aria-label={t('shell.userMenu')}>
          <Group gap={6} wrap="nowrap">
            <EmployeeAvatar name={name} size={26} />
            <Text size="sm" c="dimmed" className="time-tracker__user-role">{t(`role.${role}`)}</Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{name}</Menu.Label>
        <Menu.Item
          renderRoot={(props) => <Link to="/employees/$employeeId" params={{ employeeId }} {...props} />}
          leftSection={appIcons.user}
        >
          {t('shell.myProfile')}
        </Menu.Item>
        <Menu.Divider />
        <Menu.Label>{t('shell.viewAs')}</Menu.Label>
        {(['employee', 'lead'] as const).map((value) => (
          <Menu.Item
            key={value}
            onClick={() => setRole(value)}
            rightSection={value === role ? appIcons.approve : undefined}
            aria-checked={value === role}
            role="menuitemradio"
          >
            {t(`role.${value}`)}
          </Menu.Item>
        ))}
      </Menu.Dropdown>
    </Menu>
  );
}

// The modules a viewer has (Approvals and Employees only for a team lead), the start page first.
function Layout() {
  const t = useTranslate();
  const { isLead } = useViewer();
  const modules = [
    { to: '/', label: t('nav.overview'), exact: true },
    ...MODULES.filter((module) => isLead || module.lead !== true).map((module) => ({
      to: module.to,
      label: t(module.label),
    })),
  ];

  return (
    <div className="time-tracker__app">
      <MicroAppHeader icon={appIcons.app} title={t('shell.appName')} modules={modules} actions={<UserMenu />} />
      <main className="time-tracker__main">
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: Layout, notFoundComponent: OverviewPage });

const moduleRoute = <const P extends string>(path: P, label: TextKey, component: () => ReactNode) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path,
    staticData: { crumb: () => <TextCrumb label={label} /> },
    component,
  });

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: OverviewPage });
const clockRoute = moduleRoute('/clock', 'nav.clock', ClockPage);
const timesheetRoute = moduleRoute('/timesheet', 'nav.timesheet', TimesheetPage);
const leaveRoute = moduleRoute('/leave', 'nav.leave', LeavePage);
const sickRoute = moduleRoute('/sick', 'nav.sick', SickPage);
const calendarRoute = moduleRoute('/calendar', 'nav.calendar', CalendarPage);
const approvalsRoute = moduleRoute('/approvals', 'nav.approvals', ApprovalsPage);
const employeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/employees',
  staticData: { crumb: () => <TextCrumb label="nav.employees" /> },
});
const employeeListRoute = createRoute({ getParentRoute: () => employeesRoute, path: '/', component: EmployeesPage });
const employeeRoute = createRoute({
  getParentRoute: () => employeesRoute,
  path: '$employeeId',
  staticData: { crumb: (params) => <EmployeeCrumb id={params['employeeId'] ?? ''} /> },
  component: EmployeePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  clockRoute,
  timesheetRoute,
  leaveRoute,
  sickRoute,
  calendarRoute,
  approvalsRoute,
  employeesRoute.addChildren([employeeListRoute, employeeRoute]),
]);

const createTimeTrackerRouter = (path: string) =>
  createRouter({ routeTree, history: createMemoryHistory({ initialEntries: [path] }) });

// The routes live in memory and are mirrored in the URL hash after a prefix: `#time-tracker/employees/e3`, so a reload
// (or a shared link) opens the same page; the browser's Back and Forward step through them.
function createAppRouter(element: HTMLElement, hashPrefix: string) {
  const prefix = `#${hashPrefix}`;
  const router = createTimeTrackerRouter(pathFromHash(prefix) ?? '/');

  return { router, dispose: mirrorInHash(router, element, prefix) };
}
