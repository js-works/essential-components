import {
  defineActions,
  defineColumns,
  defineFilters,
  multiRowAction,
  useDataTableController,
} from '@local/data-table/react';
import type { SavedFilters, TableColumn } from '@local/data-table/react';
import { useToast } from '@local/overlays/react';
import { Badge, Stack, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { leaveDays, todayDate } from '../../../domain/index.js';
import type { Employee, LeaveRequest, TimeData } from '../../../domain/index.js';
import { formatDateRange, formatDays, formatStamp } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { oneOf } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { absenceText, EmployeeLabel, RequestStatusBadge } from '../../../shared/ui/parts.js';
import { newAction } from '../../../shared/ui/tableActions.js';
import { useTableSource } from '../../tracker/index.js';
import { leaveTypeFilter, requestStatusFilter } from '../filters.js';
import { useLeaveFlows } from '../flows.js';
import type { LeaveFlows } from '../flows.js';

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

// The columns of leave requests, with their headers in the current language (the employee only in a team's table).
const columnsOf = (t: Translate, mine: boolean) =>
  defineColumns<LeaveRow>([
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
  ]);

// The filters of leave requests.
const filtersOf = (t: Translate) => defineFilters({ type: leaveTypeFilter(t), status: requestStatusFilter(t) });

// What the actions of leave requests need: the flows, the toasts (when none of the selected rows fits), the data and
// whose table it is (`self`, `mine`).
type LeaveContext = {
  flows: LeaveFlows;
  toasts: ReturnType<typeof useToast>;
  data: TimeData;
  self: Employee | undefined;
  mine: boolean;
};

const pending = (row: LeaveRow) => row.status === 'pending';
const cancellable = (row: LeaveRow) => pending(row) || (row.status === 'approved' && row.from > todayDate());

// The actions of leave requests: the viewer's own (new, cancel) or a team's (approve, reject). Each applies to the
// selected rows that fit; a toast when none does.
const actionsOf = (t: Translate, { flows, toasts, data, self, mine }: LeaveContext) => {
  const nameOf = (id: string) => data.employees.find((employee) => employee.id === id)?.name ?? '';
  const only = (rows: readonly LeaveRow[], fits: (row: LeaveRow) => boolean, act: (rows: LeaveRow[]) => unknown) => {
    const fitting = rows.filter(fits);

    return fitting.length === 0 ? toasts.warn(t('leave.noneFits')) : act(fitting);
  };

  return defineActions<LeaveRow>(
    mine
      ? [
        newAction(t('leave.new'), () => self !== undefined && flows.request(data, self)),
        multiRowAction('cancel', (rows) => only(rows, cancellable, flows.cancel), {
          label: t('leave.cancel'),
          icon: appIcons.cancel,
        }),
      ]
      : [
        multiRowAction(
          'approve',
          (rows) => only(rows, pending, (fitting) => flows.decide(fitting, 'approved', nameOf)),
          {
            label: t('decision.approve'),
            icon: appIcons.approve,
          },
        ),
        multiRowAction(
          'reject',
          (rows) => only(rows, pending, (fitting) => flows.decide(fitting, 'rejected', nameOf)),
          {
            label: t('decision.reject'),
            icon: appIcons.reject,
            variant: 'danger',
          },
        ),
      ],
  );
};

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
}): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<LeaveRow>();
  const ctx = { flows: useLeaveFlows(), toasts: useToast(), data, self: employees[0], mine };
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
  }, nav.reload);

  return (
    <DataTable
      controller={nav}
      title={title}
      subtitle={subtitle}
      source={source}
      rowKey="id"
      columns={columnsOf(t, mine)}
      filters={filtersOf(t)}
      actions={actionsOf(t, ctx)}
      searchable={!mine}
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'from', direction: pendingOnly ? 'asc' : 'desc' }}
    />
  );
}
