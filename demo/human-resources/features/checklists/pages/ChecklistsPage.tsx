import { Badge, Loader, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router';
import { selectColumnFilter, useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { CHECKLIST_KINDS, checklistAnchor, isOverdue, nextTask, progressOf, todayDate } from '../../../domain';
import type { Checklist, Employee, HrData } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { oneOf } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeLabel, ProgressCell } from '../../../shared/ui/parts';
import { employeeOf, useHrData, useTableSource } from '../../hr';
import { useChecklistFlows } from '../flows';
import { taskTitle } from '../taskTitle';

export { ChecklistsPage };

type ChecklistRow = Checklist & {
  employee: Employee | undefined;
  name: string;
  // The first day of a joiner, the last day of a leaver.
  anchor: string;
  done: number;
  total: number;
  overdue: number;
  state: 'open' | 'complete';
};

function checklistRows(data: HrData): ChecklistRow[] {
  const today = todayDate();

  return data.checklists.map((checklist) => {
    const employee = employeeOf(data, checklist.employeeId);
    const progress = progressOf(checklist);

    return {
      ...checklist,
      employee,
      name: employee?.name ?? '',
      anchor: employee === undefined ? '' : checklistAnchor(checklist.kind, employee) ?? '',
      done: progress.done,
      total: progress.total,
      overdue: checklist.tasks.filter((task) => isOverdue(task, today)).length,
      state: progress.complete ? 'complete' : 'open',
    };
  });
}

// The checklists of joiners and leavers: whose, which kind, their day, how far, what comes next. The open ones first.
function ChecklistsPage(): ReactElement {
  const t = useTranslate();
  const data = useHrData();
  const nav = useDataTableController<ChecklistRow>();
  const navigate = useNavigate();
  const flows = useChecklistFlows();
  const source = useTableSource<ChecklistRow>('checklists', checklistRows, {
    search: ['name'],
    filters: {
      kind: (row, value) => oneOf(row.kind, value),
      state: (row, value) => oneOf(row.state, value),
    },
    sortValue: { done: (row) => (row.total === 0 ? 0 : row.done / row.total) },
  }, nav.reload);

  const columns = useMemo((): readonly DataTableComponent.Column<ChecklistRow>[] => [
    {
      key: 'name',
      header: t('checklists.employee'),
      width: 2.6,
      sortable: true,
      render: (row) => row.employee === undefined ? '' : <EmployeeLabel employee={row.employee} title />,
    },
    {
      key: 'kind',
      header: t('checklists.kind'),
      width: 1.9,
      sortable: true,
      render: (row) => (
        <Badge variant={row.kind === 'onboarding' ? 'light' : 'outline'} leftSection={appIcons[row.kind]}>
          {t(`checklistKind.${row.kind}`)}
        </Badge>
      ),
      filter: selectColumnFilter({
        options: CHECKLIST_KINDS.map((value) => ({ value, label: t(`checklistKind.${value}`) })),
        multiple: true,
      }),
    },
    {
      key: 'anchor',
      header: t('checklists.day'),
      width: 1.5,
      sortable: true,
      render: (row) => formatDate(row.anchor),
    },
    {
      key: 'done',
      header: t('checklists.progress'),
      width: 2,
      sortable: true,
      render: (row) => <ProgressCell done={row.done} total={row.total} />,
    },
    {
      key: 'tasks',
      header: t('checklists.next'),
      width: 2.8,
      render: (row) => {
        const task = nextTask(row);

        return task === undefined
          ? <Text size="sm" c="dimmed">{t('checklists.allDone')}</Text>
          : (
            <Stack gap={0}>
              <Text size="sm" truncate>{taskTitle(t, task)}</Text>
              <Text size="xs" c={row.overdue > 0 ? 'var(--mantine-color-error)' : 'dimmed'}>
                {row.overdue > 0
                  ? t('checklists.overdue', { count: row.overdue })
                  : t('checklists.due', { date: formatDate(task.due) })}
              </Text>
            </Stack>
          );
      },
    },
    {
      key: 'state',
      header: t('checklists.state'),
      width: 1.7,
      sortable: true,
      hideable: true,
      render: (row) =>
        row.state === 'complete'
          ? <Badge variant="light" color="gray">{t('checklistState.complete')}</Badge>
          : <Badge variant="outline">{t('checklistState.open')}</Badge>,
      filter: selectColumnFilter({
        options: (['open', 'complete'] as const).map((value) => ({ value, label: t(`checklistState.${value}`) })),
        multiple: true,
      }),
    },
  ], [t]);

  const actions = useMemo((): readonly DataTableComponent.Action<ChecklistRow>[] => [
    {
      type: 'general',
      key: 'new',
      label: t('checklists.new'),
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
      onClick: (row) => void navigate(`/onboarding/${row.id}`),
    },
    {
      type: 'multiRow',
      key: 'delete',
      label: t('common.delete'),
      icon: appIcons.remove,
      variant: 'danger',
      onClick: (rows) => data !== undefined && void flows.remove(rows, data),
    },
  ], [t, flows, navigate, data]);

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <DataTable
      controller={nav}
      title={t('checklists.title')}
      subtitle={t('checklists.subtitle')}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'anchor', direction: 'asc' }}
    />
  );
}
