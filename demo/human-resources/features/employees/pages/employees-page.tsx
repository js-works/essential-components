import { dateRangeFilter, useDataTableController } from '@local/data-table/react';
import type { SavedFilter, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { Loader } from '@mantine/core';
import { useNavigate } from 'react-router';
import { statusOf, todayDate } from '../../../domain/index.js';
import type { Employee, EmployeeStatus, HrData } from '../../../domain/index.js';
import { formatDate } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { oneOf, within } from '../../../shared/lib/local-query.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { EmployeeLabel, EmployeeStatusBadge } from '../../../shared/ui/parts.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { departmentFilter } from '../../departments/index.js';
import { departmentName, employeeOf, useHrData, useTableSource } from '../../hr/index.js';
import { employeeStatusFilter, employmentTypeFilter, locationFilter } from '../employee-filters.js';
import { useCreateEmployeeFlow, useEditEmployeeFlow } from '../employee-flows.js';

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

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Sophie Brandt', 'Engineering, full time', { department: ['Engineering'], employmentType: ['fullTime'] }),
  sharedBy('Tom Becker', 'Starting soon', { status: ['upcoming'] }),
  sharedBy('Sophie Brandt', 'Berlin office', { location: ['Berlin'] }),
];

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
      key: 'department',
      header: t('employees.department'),
      width: 2,
      sortable: true,
    },
    { key: 'manager', header: t('employees.manager'), width: 2, sortable: true, hideable: true },
    {
      key: 'location',
      header: t('employees.location'),
      width: 1.4,
      sortable: true,
      hideable: true,
    },
    {
      key: 'employmentType',
      header: t('employees.employmentType'),
      width: 1.4,
      sortable: true,
      hideable: true,
      render: (row) => t(`employmentType.${row.employmentType}`),
    },
    {
      key: 'startDate',
      header: t('employees.startDate'),
      width: 1.4,
      sortable: true,
      hideable: true,
      render: (row) => formatDate(row.startDate),
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
    },
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();
  const data = useHrData();

  return {
    department: departmentFilter(data?.departments ?? []),
    location: locationFilter(data?.employees ?? []),
    employmentType: employmentTypeFilter(t),
    startDate: dateRangeFilter(),
    status: employeeStatusFilter(t),
  };
}

function useActions(data: HrData | undefined): TableActions<EmployeeRow> {
  const t = useTranslate();
  const navigate = useNavigate();
  const createEmployee = useCreateEmployeeFlow();
  const editEmployee = useEditEmployeeFlow();

  return [
    newAction(t('employees.new'), () => data !== undefined && createEmployee(data)),
    openAction((row) => navigate(`/employees/${row.id}`)),
    editAction((row) => data !== undefined && editEmployee(row, data)),
  ];
}

// The directory: everyone with their job, manager, place, contract and status (former ones too: the status filter
// narrows them). Open one for their page.
function EmployeesPage() {
  const t = useTranslate();
  const data = useHrData();
  const tableCtrl = useDataTableController<EmployeeRow>();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(data);
  const savedFilters = useSavedFilters('human-resources:saved-filters:employees', COLLEAGUES_FILTERS);
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
  }, tableCtrl.reload);

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <DataTable
      controller={tableCtrl}
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
