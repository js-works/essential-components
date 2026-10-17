import { Badge, Loader, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import type { TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { Checklist, Employee, HrData } from '../../../domain/index.js';
import { checklistAnchor, isOverdue, nextTask, progressOf, todayDate } from '../../../domain/index.js';
import { formatDate } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { EmployeeLabel, ProgressCell } from '../../../shared/ui/parts.js';
import { employeeOf, useHrData, useTableSource } from '../../hr/index.js';
import { checklistKindFilter, checklistStateFilter } from '../checklist-filters.js';
import { useCreateChecklistFlow, useDeleteChecklistsFlow } from '../checklist-flows.js';
import { taskTitle } from '../task-title.js';

export { ChecklistTable };

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

function useColumns(): TableColumns<ChecklistRow> {
  const t = useTranslate();

  return [
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
    },
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();

  return { kind: checklistKindFilter(t), state: checklistStateFilter(t) };
}

function useActions(data: HrData | undefined): TableActions<ChecklistRow> {
  const { deleteAction, newAction, openAction } = useTableActions();
  const t = useTranslate();
  const navigate = useNavigate();
  const createChecklist = useCreateChecklistFlow();
  const deleteChecklists = useDeleteChecklistsFlow();

  return [
    newAction(t('checklists.new'), () => data !== undefined && createChecklist(data)),
    openAction((row) => navigate({ to: '/onboarding/$checklistId', params: { checklistId: row.id } })),
    deleteAction((rows) => data !== undefined && deleteChecklists(rows, data)),
  ];
}

function ChecklistTable() {
  const t = useTranslate();
  const data = useHrData();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(data);
  const savedFilters = useSavedTableFilters('checklists');
  const source = useTableSource<ChecklistRow>('checklists', checklistRows, {
    search: ['name'],
    sortValue: { done: (row) => (row.total === 0 ? 0 : row.done / row.total) },
  });

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <DataTable
      title={t('checklists.title')}
      subtitle={t('checklists.subtitle')}
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'anchor', direction: 'asc' }}
    />
  );
}
