import { Badge, Loader } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { selectColumnFilter, useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { todayDate, todayStatus, vacationBalance } from '../../../domain';
import type { Employee, TimeData, TodayStatus } from '../../../domain';
import { formatDays } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { oneOf } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeLabel, LeadOnly, TodayBadge } from '../../../shared/ui/parts';
import { useTableSource, useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { useEmployeeFlows } from '../flows';

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

// All employees (a team lead): their team, hours, vacation left and where they are today. Open one for their page.
function EmployeesPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const nav = useDataTableController<EmployeeRow>();
  const navigate = useNavigate();
  const flows = useEmployeeFlows();
  const teams = data?.teams;
  const source = useTableSource<EmployeeRow>('employees', employeeRows, {
    search: ['name', 'email', 'title', 'team'],
    filters: {
      team: (row, value) => oneOf(row.team, value),
      status: (row, value) => oneOf(row.status, value),
      todayKey: (row, value) => oneOf(row.todayKey, value),
    },
  }, nav.reload);

  const columns = useMemo((): readonly DataTableComponent.Column<EmployeeRow>[] => [
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
      filter: selectColumnFilter({
        options: (teams ?? []).map((team) => ({ value: team.name, label: team.name })),
        multiple: true,
      }),
    },
    {
      key: 'todayKey',
      header: t('employees.today'),
      width: 2,
      sortable: true,
      render: (row) => <TodayBadge status={row.today} />,
      filter: selectColumnFilter({
        options: [
          ...(['working', 'break', 'out'] as const).map((value) => ({ value, label: t(`clockState.${value}`) })),
          ...(['vacation', 'special', 'unpaid', 'sick', 'holiday'] as const).map((value) => ({
            value,
            label: t(`absence.${value}`),
          })),
        ],
        multiple: true,
      }),
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
      filter: selectColumnFilter({
        options: (['active', 'inactive'] as const).map((value) => ({ value, label: t(`employees.${value}`) })),
        multiple: true,
      }),
    },
  ], [t, teams]);

  const actions = useMemo((): readonly DataTableComponent.Action<EmployeeRow>[] => [
    {
      type: 'general',
      key: 'new',
      label: t('employees.new'),
      icon: appIcons.add,
      variant: 'primary',
      onClick: () => teams !== undefined && void flows.create(teams),
    },
    {
      type: 'singleRow',
      key: 'open',
      icon: appIcons.open,
      tip: t('common.open'),
      show: 'column',
      default: true,
      onClick: (row) => void navigate(`/employees/${row.id}`),
    },
    {
      type: 'singleRow',
      key: 'edit',
      icon: appIcons.edit,
      tip: t('common.edit'),
      show: 'both',
      onClick: (row) => teams !== undefined && void flows.edit(row, teams),
    },
  ], [t, flows, navigate, teams]);

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
      columns={columns}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
