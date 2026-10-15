import { defineActions, defineColumns, singleRowAction, useDataTableController } from '@local/data-table/react';
import type { ReactElement } from 'react';
import { departmentPath, todayDate } from '../../../domain/index.js';
import type { Department, Employee, HrData } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { EmployeeLabel } from '../../../shared/ui/parts.js';
import { editAction } from '../../../shared/ui/tableActions.js';
import { employeeOf, useTableSource } from '../../hr/index.js';
import { useDepartmentFlows } from '../flows.js';
import type { DepartmentFlows } from '../flows.js';
import { headcount } from '../headcount.js';

export { DepartmentTable };

type DepartmentRow = Department & {
  path: string;
  parent: string;
  head: Employee | undefined;
  headName: string;
  people: number;
  total: number;
};

function departmentRows(data: HrData): DepartmentRow[] {
  const today = todayDate();

  return data.departments.map((department) => {
    const head = employeeOf(data, department.headId);

    return {
      ...department,
      path: departmentPath(data.departments, department.id).join(' › '),
      parent: data.departments.find((candidate) => candidate.id === department.parentId)?.name ?? '',
      head,
      headName: head?.name ?? '',
      people: headcount(data, department.id, today),
      total: headcount(data, department.id, today, true),
    };
  });
}

// The columns of the departments list, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<DepartmentRow>([
    { key: 'name', header: t('departments.name'), width: 2, sortable: true },
    { key: 'parent', header: t('departments.parent'), width: 2, sortable: true },
    {
      key: 'headName',
      header: t('departments.head'),
      width: 2.6,
      sortable: true,
      render: (row) => row.head === undefined ? '' : <EmployeeLabel employee={row.head} title />,
    },
    { key: 'people', header: t('departments.peopleColumn'), width: 1, align: 'end', sortable: true },
    { key: 'total', header: t('departments.totalColumn'), width: 1.2, align: 'end', sortable: true, hideable: true },
    { key: 'costCenter', header: t('departments.costCenter'), width: 1.2, sortable: true, hideable: true },
  ]);

// The actions of the departments list: edit (the default action), delete.
const actionsOf = (t: Translate, flows: DepartmentFlows, data: HrData) =>
  defineActions<DepartmentRow>([
    editAction((row) => flows.edit(row, data), { default: true }),
    singleRowAction('delete', (row) => flows.remove(row), {
      label: t('common.delete'),
      icon: appIcons.remove,
      variant: 'danger',
      show: 'toolbar',
    }),
  ]);

// The departments as a list: their place in the tree, head, headcount and cost center. Edit, delete.
function DepartmentTable({ data }: { data: HrData }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<DepartmentRow>();
  const flows = useDepartmentFlows();
  const source = useTableSource<DepartmentRow>('departments', departmentRows, {
    search: ['name', 'path', 'headName', 'costCenter'],
  }, nav.reload);

  return (
    <DataTable
      controller={nav}
      source={source}
      rowKey="id"
      columns={columnsOf(t)}
      actions={actionsOf(t, flows, data)}
      searchable
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
