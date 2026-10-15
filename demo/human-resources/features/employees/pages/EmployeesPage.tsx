import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  useDataTableController,
} from '@local/data-table/react';
import type { SavedFilter } from '@local/data-table/react';
import { Loader } from '@mantine/core';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { statusOf, todayDate } from '../../../domain/index.js';
import type { Employee, EmployeeStatus, HrData } from '../../../domain/index.js';
import { formatDate } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { oneOf, within } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { EmployeeLabel, EmployeeStatusBadge } from '../../../shared/ui/parts.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { departmentFilter } from '../../departments/index.js';
import { departmentName, employeeOf, useHrData, useTableSource } from '../../hr/index.js';
import { employeeStatusFilter, employmentTypeFilter, locationFilter } from '../filters.js';
import { useEmployeeFlows } from '../flows.js';
import type { EmployeeFlows } from '../flows.js';

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

// The columns of the directory, with their headers in the current language.
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
  ]);

// The filters of the directory (the departments and the places: those of the data).
const filtersOf = (t: Translate, data: HrData) =>
  defineFilters({
    department: departmentFilter(data.departments),
    location: locationFilter(data.employees),
    employmentType: employmentTypeFilter(t),
    startDate: dateRangeFilter(),
    status: employeeStatusFilter(t),
  });

// The actions of the directory: new, open (the default action), edit.
const actionsOf = (t: Translate, flows: EmployeeFlows, navigate: NavigateFunction, data: HrData) =>
  defineActions<EmployeeRow>([
    newAction(t('employees.new'), () => flows.create(data)),
    openAction((row) => navigate(`/employees/${row.id}`)),
    editAction((row) => flows.edit(row, data)),
  ]);

// The directory: everyone with their job, manager, place, contract and status (former ones too: the status filter
// narrows them). Open one for their page.
function EmployeesPage(): ReactElement {
  const t = useTranslate();
  const data = useHrData();
  const nav = useDataTableController<EmployeeRow>();
  const flows = useEmployeeFlows();
  const navigate = useNavigate();
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
  }, nav.reload);

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
      filters={filtersOf(t, data)}
      actions={actionsOf(t, flows, navigate, data)}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
