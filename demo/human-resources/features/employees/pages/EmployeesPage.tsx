import { Loader } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataTableController,
} from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { EMPLOYEE_STATUSES, EMPLOYMENT_TYPES, statusOf, todayDate } from '../../../domain';
import type { Employee, EmployeeStatus, HrData } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { oneOf, within } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeLabel, EmployeeStatusBadge } from '../../../shared/ui/parts';
import { departmentName, employeeOf, useHrData, useTableSource } from '../../hr';
import { useEmployeeFlows } from '../flows';

export { EmployeesPage };

type EmployeeRow = Employee & {
  department: string;
  manager: string;
  status: EmployeeStatus;
};

function employeeRows(data: HrData): EmployeeRow[] {
  const today = todayDate();

  return data.employees.map((employee) => ({
    ...employee,
    department: departmentName(data, employee.departmentId),
    manager: employeeOf(data, employee.managerId)?.name ?? '',
    status: statusOf(employee, today),
  }));
}

// The order of the states when sorted: the coming ones first, the former ones last.
const STATUS_ORDER: Readonly<Record<EmployeeStatus, number>> = { upcoming: 0, active: 1, leaving: 2, former: 3 };

// The directory: everyone with their job, manager, place, contract and status (former ones too: the status filter
// narrows them). Open one for their page.
function EmployeesPage(): ReactElement {
  const t = useTranslate();
  const data = useHrData();
  const nav = useDataTableController<EmployeeRow>();
  const navigate = useNavigate();
  const flows = useEmployeeFlows();
  const source = useTableSource<EmployeeRow>('employees', employeeRows, {
    search: ['name', 'email', 'title', 'department', 'manager', 'location'],
    filters: {
      department: (row, value) => oneOf(row.department, value),
      employmentType: (row, value) => oneOf(row.employmentType, value),
      location: (row, value) => oneOf(row.location, value),
      status: (row, value) => oneOf(row.status, value),
      startDate: (row, value) => within(row.startDate, value),
    },
    sortValue: { status: (row) => STATUS_ORDER[row.status] },
  }, nav.reload);

  const departments = data?.departments;
  const locations = useMemo(
    () => [...new Set(data?.employees.map((employee) => employee.location) ?? [])].sort(),
    [data],
  );

  const columns = useMemo((): readonly DataTableComponent.Column<EmployeeRow>[] => [
    {
      key: 'name',
      header: t('employees.name'),
      width: 3,
      sortable: true,
      render: (row) => <EmployeeLabel employee={row} title />,
    },
    {
      key: 'department',
      header: t('employees.department'),
      width: 2,
      sortable: true,
      filter: selectColumnFilter({
        options: [...(departments ?? [])]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((department) => ({ value: department.name, label: department.name })),
        multiple: true,
      }),
    },
    { key: 'manager', header: t('employees.manager'), width: 2, sortable: true, hideable: true },
    {
      key: 'location',
      header: t('employees.location'),
      width: 1.4,
      sortable: true,
      hideable: true,
      filter: selectColumnFilter({
        options: locations.map((location) => ({ value: location, label: location })),
        multiple: true,
      }),
    },
    {
      key: 'employmentType',
      header: t('employees.employmentType'),
      width: 1.4,
      sortable: true,
      hideable: true,
      render: (row) => t(`employmentType.${row.employmentType}`),
      filter: selectColumnFilter({
        options: EMPLOYMENT_TYPES.map((value) => ({ value, label: t(`employmentType.${value}`) })),
        multiple: true,
      }),
    },
    {
      key: 'startDate',
      header: t('employees.startDate'),
      width: 1.4,
      sortable: true,
      hideable: true,
      render: (row) => formatDate(row.startDate),
      filter: dateRangeColumnFilter(),
    },
    { key: 'email', header: t('employees.email'), width: 2.6, sortable: true, hideable: true, hidden: true },
    { key: 'phone', header: t('employees.phone'), width: 2, hideable: true, hidden: true },
    {
      key: 'status',
      header: t('employees.status'),
      width: 1.3,
      sortable: true,
      hideable: true,
      render: (row) => <EmployeeStatusBadge status={row.status} />,
      filter: selectColumnFilter({
        options: EMPLOYEE_STATUSES.map((value) => ({ value, label: t(`employeeStatus.${value}`) })),
        multiple: true,
      }),
    },
  ], [t, departments, locations]);

  const actions = useMemo((): readonly DataTableComponent.Action<EmployeeRow>[] => [
    {
      type: 'general',
      key: 'new',
      label: t('employees.new'),
      icon: appIcons.add,
      variant: 'primary',
      onClick: () => data !== undefined && void flows.create(data),
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
      onClick: (row) => data !== undefined && void flows.edit(row, data),
    },
  ], [t, flows, navigate, data]);

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
