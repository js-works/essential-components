import { Badge, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { selectColumnFilter, useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { leaveDays, todayDate } from '../../../domain';
import type { Employee, LeaveRequest, TimeData } from '../../../domain';
import { formatDateRange, formatDays, formatStamp } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { oneOf } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { absenceText, EmployeeLabel, RequestStatusBadge } from '../../../shared/ui/parts';
import { useTableSource } from '../../tracker';
import { useLeaveFlows } from '../flows';

export { LeaveTable };

type LeaveRow = LeaveRequest & { employee: Employee | undefined; employeeName: string; days: number };

// The employee of a request, with a link to their page (only in the team's table).
function employeeColumn(header: string): DataTableComponent.Column<LeaveRow> {
  return {
    key: 'employeeName',
    header,
    width: 3,
    sortable: true,
    render: (row) => row.employee === undefined ? row.employeeName : <EmployeeLabel employee={row.employee} />,
  };
}

// Leave requests as a table: the viewer's own (`mine`: new, cancel) or those of employees (a team lead: approve,
// reject; `pendingOnly`: only those still to decide, the approvals). Only pending requests are decided and only a
// pending or coming approved one is cancelled; others among the selected rows are skipped (a toast says so when none is
// left).
function LeaveTable({ data, employees, mine, pendingOnly = false, title, subtitle }: {
  data: TimeData;
  employees: readonly Employee[];
  mine: boolean;
  pendingOnly?: boolean;
  title: string;
  subtitle?: string;
}): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<LeaveRow>();
  const flows = useLeaveFlows();
  const toasts = useToast();
  const ids = employees.map((employee) => employee.id);
  const self = employees[0];

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

  const nameOf = (id: string) => data.employees.find((employee) => employee.id === id)?.name ?? '';

  const columns = useMemo((): readonly DataTableComponent.Column<LeaveRow>[] => [
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
      filter: selectColumnFilter({
        options: (['vacation', 'special', 'unpaid'] as const).map((value) => ({
          value,
          label: t(`absence.${value}`),
        })),
        multiple: true,
      }),
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
      filter: selectColumnFilter({
        options: (['pending', 'approved', 'rejected', 'cancelled'] as const).map((value) => ({
          value,
          label: t(`status.${value}`),
        })),
        multiple: true,
      }),
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
  ], [mine, t]);

  const actions = useMemo((): readonly DataTableComponent.Action<LeaveRow>[] => {
    // The rows an action applies to; a toast when none of the selected does.
    const only = (rows: readonly LeaveRow[], fits: (row: LeaveRow) => boolean, act: (rows: LeaveRow[]) => void) => {
      const fitting = rows.filter(fits);

      if (fitting.length === 0) {
        toasts.warn(t('leave.noneFits'));
      } else {
        act(fitting);
      }
    };
    const pending = (row: LeaveRow) => row.status === 'pending';
    const cancellable = (row: LeaveRow) => pending(row) || (row.status === 'approved' && row.from > todayDate());

    return mine
      ? [
        {
          type: 'general',
          key: 'new',
          label: t('leave.new'),
          icon: appIcons.add,
          variant: 'primary',
          onClick: () => self !== undefined && void flows.request(data, self),
        },
        {
          type: 'multiRow',
          key: 'cancel',
          label: t('leave.cancel'),
          icon: appIcons.cancel,
          onClick: (rows) => only(rows, cancellable, (fitting) => void flows.cancel(fitting)),
        },
      ]
      : [
        {
          type: 'multiRow',
          key: 'approve',
          label: t('decision.approve'),
          icon: appIcons.approve,
          onClick: (rows) => only(rows, pending, (fitting) => void flows.decide(fitting, 'approved', nameOf)),
        },
        {
          type: 'multiRow',
          key: 'reject',
          label: t('decision.reject'),
          icon: appIcons.reject,
          variant: 'danger',
          onClick: (rows) => only(rows, pending, (fitting) => void flows.decide(fitting, 'rejected', nameOf)),
        },
      ];
  }, [mine, t, flows, data, self, toasts]);

  return (
    <DataTable
      controller={nav}
      title={title}
      subtitle={subtitle}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable={!mine}
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'from', direction: pendingOnly ? 'asc' : 'desc' }}
    />
  );
}
