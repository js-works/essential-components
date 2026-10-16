import { multiRowAction, useDataTableController } from '@local/data-table/react';
import type { SavedFilters, TableActions, TableColumn, TableColumns, TableFilters } from '@local/data-table/react';
import { useToast } from '@local/overlays/react';
import { Badge, Stack, Text } from '@mantine/core';
import { leaveDays, todayDate } from '../../../domain/index.js';
import type { Employee, LeaveRequest, TimeData } from '../../../domain/index.js';
import { formatDateRange, formatDays, formatStamp } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { oneOf } from '../../../shared/lib/local-query.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { absenceText, EmployeeLabel, RequestStatusBadge } from '../../../shared/ui/parts.js';
import { newAction } from '../../../shared/ui/table-actions.js';
import { useTableSource } from '../../tracker/index.js';
import { leaveTypeFilter, requestStatusFilter } from '../leave-filters.js';
import { useCancelLeaveFlow, useDecideLeaveFlow, useRequestLeaveFlow } from '../leave-flows.js';

export { LeaveTable };

type LeaveRow = LeaveRequest & { employee: Employee | undefined; employeeName: string; days: number };

// The employee of a request, with a link to their page (only in the team's table).
function employeeColumn(header: string): TableColumn<LeaveRow> {
  return {
    key: 'employeeName',
    header,
    width: 3,
    sortable: true,
    render: (row) => row.employee === undefined ? row.employeeName : <EmployeeLabel employee={row.employee} />,
  };
}

function useColumns(mine: boolean): TableColumns<LeaveRow> {
  const t = useTranslate();

  return [
    ...(mine ? [] : [employeeColumn(t('leave.employee'))]),
    {
      key: 'type',
      header: t('leave.type'),
      width: 2,
      sortable: true,
      render: (row) => (
        <Badge variant="light">
          {absenceText(t, { kind: row.type, halfDay: row.halfDay })}
        </Badge>
      ),
    },
    {
      key: 'from',
      header: t('leave.period'),
      width: 3,
      sortable: true,
      render: (row) => formatDateRange(row.from, row.to),
    },
    {
      key: 'days',
      header: t('leave.days'),
      width: 1,
      align: 'end',
      sortable: true,
      render: (row) => formatDays(row.days),
    },
    {
      key: 'status',
      header: t('leave.status'),
      width: 2,
      sortable: true,
      render: (row) => <RequestStatusBadge status={row.status} />,
    },
    {
      key: 'note',
      header: t('leave.note'),
      width: 3,
      hideable: true,
      render: (row) => (
        <Stack gap={0}>
          {row.note !== '' && <Text size="sm" truncate>{row.note}</Text>}
          {row.comment !== '' && <Text size="xs" c="dimmed" truncate>{`${t('leave.comment')}: ${row.comment}`}</Text>}
        </Stack>
      ),
    },
    {
      key: 'created',
      header: t('leave.requested'),
      width: 2,
      sortable: true,
      hideable: true,
      hidden: true,
      render: (row) => formatStamp(row.created),
    },
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();

  return { type: leaveTypeFilter(t), status: requestStatusFilter(t) };
}

const pending = (row: LeaveRow) => row.status === 'pending';
const cancellable = (row: LeaveRow) => pending(row) || (row.status === 'approved' && row.from > todayDate());

function useActions(data: TimeData, mine: boolean, self: Employee | undefined): TableActions<LeaveRow> {
  const t = useTranslate();
  const toasts = useToast();
  const requestLeave = useRequestLeaveFlow();
  const cancelLeave = useCancelLeaveFlow();
  const decideLeave = useDecideLeaveFlow();
  const nameOf = (id: string) => data.employees.find((employee) => employee.id === id)?.name ?? '';
  const only = (rows: readonly LeaveRow[], fits: (row: LeaveRow) => boolean, act: (rows: LeaveRow[]) => unknown) => {
    const fitting = rows.filter(fits);

    return fitting.length === 0 ? toasts.warn(t('leave.noneFits')) : act(fitting);
  };

  return mine
    ? [
      newAction(t('leave.new'), () => self !== undefined && requestLeave(data, self)),
      multiRowAction('cancel', (rows) => only(rows, cancellable, cancelLeave), {
        label: t('leave.cancel'),
        icon: appIcons.cancel,
      }),
    ]
    : [
      multiRowAction('approve', (rows) => only(rows, pending, (fitting) => decideLeave(fitting, 'approved', nameOf)), {
        label: t('decision.approve'),
        icon: appIcons.approve,
      }),
      multiRowAction('reject', (rows) => only(rows, pending, (fitting) => decideLeave(fitting, 'rejected', nameOf)), {
        label: t('decision.reject'),
        icon: appIcons.reject,
        variant: 'danger',
      }),
    ];
}

// Leave requests as a table: the viewer's own (`mine`: new, cancel) or those of employees (a team lead: approve,
// reject; `pendingOnly`: only those still to decide, the approvals). Only pending requests are decided and only a
// pending or coming approved one is cancelled; others among the selected rows are skipped (a toast says so when none is
// left). `savedFilters` only where the page gives them (the Leave page's team tab, 2026-10-11).
function LeaveTable({ data, employees, mine, pendingOnly = false, title, subtitle, savedFilters }: {
  data: TimeData;
  employees: readonly Employee[];
  mine: boolean;
  pendingOnly?: boolean;
  title: string;
  subtitle?: string;
  savedFilters?: SavedFilters;
}) {
  const tableCtrl = useDataTableController<LeaveRow>();
  const columns = useColumns(mine);
  const filters = useFilters();
  const actions = useActions(data, mine, employees[0]);
  const ids = employees.map((employee) => employee.id);

  const source = useTableSource<LeaveRow>(`leave:${pendingOnly}:${ids.join(',')}`, (current) =>
    current.leave
      .filter((request) => ids.includes(request.employeeId) && (!pendingOnly || request.status === 'pending'))
      .map((request) => {
        const employee = current.employees.find((candidate) => candidate.id === request.employeeId);

        return {
          ...request,
          employee,
          employeeName: employee?.name ?? '',
          days: leaveDays(request, current.holidays),
        };
      }), {
    search: ['employeeName', 'note', 'comment'],
    filters: {
      type: (row, value) => oneOf(row.type, value),
      status: (row, value) => oneOf(row.status, value),
    },
  }, tableCtrl.reload);

  return (
    <DataTable
      controller={tableCtrl}
      title={title}
      subtitle={subtitle}
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable={!mine}
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'from', direction: pendingOnly ? 'asc' : 'desc' }}
    />
  );
}
