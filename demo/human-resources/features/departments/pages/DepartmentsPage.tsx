import { Button, Loader, Stack, Tabs } from '@mantine/core';
import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import { useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { departmentPath, todayDate } from '../../../domain';
import type { Department, Employee, HrData } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeLabel, PageHeader } from '../../../shared/ui/parts';
import { employeeOf, useHrData, useTableSource } from '../../hr';
import { OrgChart } from '../components/OrgChart';
import { useDepartmentFlows } from '../flows';
import { headcount } from '../headcount';

export { DepartmentsPage };

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

// The departments: an org chart (the tree from the top down), and a list. New, edit, delete.
function DepartmentsPage(): ReactElement {
  const t = useTranslate();
  const data = useHrData();
  const flows = useDepartmentFlows();
  const [tab, setTab] = useState<string | null>('chart');

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <Stack gap="md">
      <PageHeader
        title={t('departments.title')}
        subtitle={t('departments.subtitle', { count: data.departments.length })}
        actions={
          <Button size="xs" leftSection={appIcons.add} onClick={() => void flows.create(data)}>
            {t('departments.new')}
          </Button>
        }
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List className="human-resources__tabs" mb="md">
          <Tabs.Tab value="chart" leftSection={appIcons.orgChart}>{t('departments.tabChart')}</Tabs.Tab>
          <Tabs.Tab value="list">{t('departments.tabList')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="chart">
          <OrgChart data={data} />
        </Tabs.Panel>
        <Tabs.Panel value="list">
          <DepartmentTable data={data} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function DepartmentTable({ data }: { data: HrData }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<DepartmentRow>();
  const flows = useDepartmentFlows();
  const source = useTableSource<DepartmentRow>('departments', departmentRows, {
    search: ['name', 'path', 'headName', 'costCenter'],
  }, nav.reload);

  const columns = useMemo((): readonly DataTableComponent.Column<DepartmentRow>[] => [
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
  ], [t]);

  const actions = useMemo((): readonly DataTableComponent.Action<DepartmentRow>[] => [
    {
      type: 'singleRow',
      key: 'edit',
      icon: appIcons.edit,
      tip: t('common.edit'),
      show: 'both',
      default: true,
      onClick: (row) => void flows.edit(row, data),
    },
    {
      type: 'singleRow',
      key: 'delete',
      label: t('common.delete'),
      icon: appIcons.remove,
      variant: 'danger',
      show: 'toolbar',
      onClick: (row) => void flows.remove(row),
    },
  ], [t, flows, data]);

  return (
    <DataTable
      controller={nav}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
