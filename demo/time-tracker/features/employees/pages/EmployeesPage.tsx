import { defineActions, defineColumns, defineFilters, useDataTableController } from '@local/data-table/react';
import type { SavedFilter } from '@local/data-table/react';
import { Badge, Loader } from '@mantine/core';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { todayDate, todayStatus, vacationBalance } from '../../../domain/index.js';
import type { Employee, Team, TimeData, TodayStatus } from '../../../domain/index.js';
import { formatDays } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { oneOf } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { EmployeeLabel, LeadOnly, TodayBadge } from '../../../shared/ui/parts.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { useTableSource, useTimeData } from '../../tracker/index.js';
import { useViewer } from '../../viewer/index.js';
import { employeeStatusFilter, teamFilter, todayFilter } from '../filters.js';
import { useEmployeeFlows } from '../flows.js';
import type { EmployeeFlows } from '../flows.js';

export { EmployeesPage };

type EmployeeRow = Employee & {
  team: string;
  remaining: number;
  today: TodayStatus;
  todayKey: string;
  status: 'active' | 'inactive';
};

function employeeRows(data: TimeData): EmployeeRow[] {
  const today = todayDate();
  const year = Number(today.slice(0, 4));

  return data.employees.map((employee) => {
    const status = todayStatus(employee, data, today);

    return {
      ...employee,
      team: data.teams.find((team) => team.id === employee.teamId)?.name ?? '',
      remaining: vacationBalance(employee, data.leave, year, today, data.holidays).remaining,
      today: status,
      todayKey: status.kind === 'clock' ? status.state : status.absence.kind,
      status: employee.active ? 'active' : 'inactive',
    };
  });
}

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Julia Wagner', 'Absent today', { todayKey: ['vacation', 'special', 'unpaid', 'sick', 'holiday'] }),
  sharedBy('Felix Braun', 'Engineering', { team: ['Engineering'] }),
];

// The columns of the employees list, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<EmployeeRow>([
    {
      key: 'name',
      header: t('employees.name'),
      width: 3,
      sortable: true,
      render: (row) => <EmployeeLabel employee={row} title />,
    },
    {
      key: 'team',
      header: t('employees.team'),
      width: 2,
      sortable: true,
    },
    {
      key: 'todayKey',
      header: t('employees.today'),
      width: 2,
      sortable: true,
      render: (row) => <TodayBadge status={row.today} />,
    },
    {
      key: 'weeklyHours',
      header: t('employees.weeklyHours'),
      width: 1.4,
      align: 'end',
      sortable: true,
      hideable: true,
    },
    {
      key: 'remaining',
      header: t('employees.vacationLeft'),
      width: 1.6,
      align: 'end',
      sortable: true,
      hideable: true,
      render: (row) => formatDays(row.remaining),
    },
    { key: 'email', header: t('employees.email'), width: 3, sortable: true, hideable: true, hidden: true },
    {
      key: 'status',
      header: t('employees.status'),
      width: 1.4,
      sortable: true,
      hideable: true,
      render: (row) => (
        <Badge variant="light" color={row.active ? undefined : 'gray'}>{t(`employees.${row.status}`)}</Badge>
      ),
    },
  ]);

// The filters of the employees list.
const filtersOf = (t: Translate, teams: readonly Team[]) =>
  defineFilters({ team: teamFilter(teams), todayKey: todayFilter(t), status: employeeStatusFilter(t) });

// The actions of the employees list: new, open (the default action), edit.
const actionsOf = (t: Translate, flows: EmployeeFlows, navigate: NavigateFunction, teams: readonly Team[]) =>
  defineActions<EmployeeRow>([
    newAction(t('employees.new'), () => flows.create(teams)),
    openAction((row) => navigate(`/employees/${row.id}`)),
    editAction((row) => flows.edit(row, teams)),
  ]);

// All employees (a team lead): their team, hours, vacation left and where they are today. Open one for their page.
function EmployeesPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const nav = useDataTableController<EmployeeRow>();
  const flows = useEmployeeFlows();
  const navigate = useNavigate();
  const savedFilters = useSavedFilters('time-tracker:saved-filters:employees', COLLEAGUES_FILTERS);
  const source = useTableSource<EmployeeRow>('employees', employeeRows, {
    search: ['name', 'email', 'title', 'team'],
    filters: {
      team: (row, value) => oneOf(row.team, value),
      status: (row, value) => oneOf(row.status, value),
      todayKey: (row, value) => oneOf(row.todayKey, value),
    },
  }, nav.reload);

  if (!viewer.isLead) {
    return <LeadOnly />;
  }

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <DataTable
      controller={nav}
      title={t('employees.title')}
      subtitle={t('employees.subtitle')}
      source={source}
      rowKey="id"
      columns={columnsOf(t)}
      filters={filtersOf(t, data.teams)}
      actions={actionsOf(t, flows, navigate, data.teams)}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
