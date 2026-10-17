import { Badge, Loader } from '@mantine/core';
import { useNavigate } from 'react-router';

import type { TableActions, TableColumns, TableFilters } from '@local/data-table/react';

import type { Employee, TimeData, TodayStatus } from '../../../domain/index.js';
import { todayDate, todayStatus, vacationBalance } from '../../../domain/index.js';
import { formatDays } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { EmployeeLabel, LeadOnly, TodayBadge } from '../../../shared/ui/parts.js';
import { useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { useTableSource, useTimeData } from '../../tracker/index.js';
import { useViewer } from '../../viewer/index.js';
import { employeeStatusFilter, teamFilter, todayFilter } from '../employee-filters.js';
import { useCreateEmployeeFlow, useEditEmployeeFlow } from '../employee-flows.js';

export { EmployeeTable };

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

function useColumns(): TableColumns<EmployeeRow> {
  const t = useTranslate();

  return [
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
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();
  const teams = useTimeData()?.teams ?? [];

  return { team: teamFilter(teams), todayKey: todayFilter(t), status: employeeStatusFilter(t) };
}

function useActions(): TableActions<EmployeeRow> {
  const t = useTranslate();
  const navigate = useNavigate();
  const teams = useTimeData()?.teams ?? [];
  const createEmployee = useCreateEmployeeFlow();
  const editEmployee = useEditEmployeeFlow();

  return [
    newAction(t('employees.new'), () => createEmployee(teams)),
    openAction((row) => navigate(`/employees/${row.id}`)),
    editAction((row) => editEmployee(row, teams)),
  ];
}

// All employees (a team lead): their team, hours, vacation left and where they are today. Open one for their page.
function EmployeeTable() {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions();
  const savedFilters = useSavedFilters('employees');
  const source = useTableSource<EmployeeRow>('employees', employeeRows, {
    search: ['name', 'email', 'title', 'team'],
  });

  if (!viewer.isLead) {
    return <LeadOnly />;
  }

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <DataTable
      title={t('employees.title')}
      subtitle={t('employees.subtitle')}
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
