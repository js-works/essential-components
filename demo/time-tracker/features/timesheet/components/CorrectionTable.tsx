import { Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { minutesOf } from '../../../domain';
import type { Correction, Employee, TimeData } from '../../../domain';
import { formatDate, formatDuration, formatStamp, formatTime } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeLabel } from '../../../shared/ui/parts';
import { useTableSource } from '../../tracker';
import { useCorrectionFlows } from '../flows';

export { CorrectionTable };

type CorrectionRow = Correction & { employee: Employee | undefined; employeeName: string; minutes: number };

// The pending corrections of employees, for a team lead to approve (the stretch becomes an entry of the day) or to
// reject.
function CorrectionTable({ data, employees, title, subtitle }: {
  data: TimeData;
  employees: readonly Employee[];
  title: string;
  subtitle?: string;
}): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<CorrectionRow>();
  const flows = useCorrectionFlows();
  const ids = employees.map((employee) => employee.id);

  const source = useTableSource<CorrectionRow>(
    `corrections:${ids.join(',')}`,
    (current) =>
      current.corrections
        .filter((correction) => ids.includes(correction.employeeId) && correction.status === 'pending')
        .map((correction) => {
          const employee = current.employees.find((candidate) => candidate.id === correction.employeeId);

          return {
            ...correction,
            employee,
            employeeName: employee?.name ?? '',
            minutes: minutesOf(correction.end) - minutesOf(correction.start),
          };
        }),
    { search: ['employeeName', 'reason'] },
    nav.reload,
  );

  const nameOf = (id: string) => data.employees.find((employee) => employee.id === id)?.name ?? '';

  const columns = useMemo((): readonly DataTableComponent.Column<CorrectionRow>[] => [
    {
      key: 'employeeName',
      header: t('correction.employee'),
      width: 3,
      sortable: true,
      render: (row) => row.employee === undefined ? row.employeeName : <EmployeeLabel employee={row.employee} />,
    },
    { key: 'date', header: t('correction.day'), width: 2, sortable: true, render: (row) => formatDate(row.date) },
    {
      key: 'start',
      header: t('correction.time'),
      width: 2,
      render: (row) => (
        <Text size="sm" className="time-tracker__figures">
          {`${formatTime(row.start)} – ${formatTime(row.end)} (${formatDuration(row.minutes)})`}
        </Text>
      ),
    },
    { key: 'reason', header: t('correction.reason'), width: 4 },
    {
      key: 'created',
      header: t('correction.requested'),
      width: 2,
      sortable: true,
      hideable: true,
      render: (row) => formatStamp(row.created),
    },
  ], [t]);

  const actions = useMemo((): readonly DataTableComponent.Action<CorrectionRow>[] => [
    {
      type: 'multiRow',
      key: 'approve',
      label: t('decision.approve'),
      icon: appIcons.approve,
      onClick: (rows) => void flows.decide(rows, 'approved', nameOf),
    },
    {
      type: 'multiRow',
      key: 'reject',
      label: t('decision.reject'),
      icon: appIcons.reject,
      variant: 'danger',
      onClick: (rows) => void flows.decide(rows, 'rejected', nameOf),
    },
  ], [t, flows, data]);

  return (
    <DataTable
      controller={nav}
      title={title}
      subtitle={subtitle}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'date', direction: 'asc' }}
    />
  );
}
