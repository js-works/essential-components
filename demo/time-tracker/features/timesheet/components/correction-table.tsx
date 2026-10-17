import { Text } from '@mantine/core';

import type { TableActions, TableColumns } from '@local/data-table/react';
import { multiRowAction } from '@local/data-table/react';
import { DataTable } from '@local/micro-app';

import type { Correction, Employee, TimeData } from '../../../domain/index.js';
import { minutesOf } from '../../../domain/index.js';
import { formatDate, formatDuration, formatStamp, formatTime } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { EmployeeLabel } from '../../../shared/ui/parts.js';
import { useTableSource } from '../../tracker/index.js';
import { useDecideCorrectionsFlow } from '../timesheet-flows.js';

export { CorrectionTable };

type CorrectionRow = Correction & { employee: Employee | undefined; employeeName: string; minutes: number };

function useColumns(): TableColumns<CorrectionRow> {
  const t = useTranslate();

  return [
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
  ];
}

function useActions(data: TimeData): TableActions<CorrectionRow> {
  const t = useTranslate();
  const decideCorrections = useDecideCorrectionsFlow();
  const nameOf = (id: string) => data.employees.find((employee) => employee.id === id)?.name ?? '';

  return [
    multiRowAction('approve', (rows) => decideCorrections(rows, 'approved', nameOf), {
      label: t('decision.approve'),
      icon: appIcons.approve,
    }),
    multiRowAction('reject', (rows) => decideCorrections(rows, 'rejected', nameOf), {
      label: t('decision.reject'),
      icon: appIcons.reject,
      variant: 'danger',
    }),
  ];
}

function CorrectionTable({ data, employees, title, subtitle }: {
  data: TimeData;
  employees: readonly Employee[];
  title: string;
  subtitle?: string;
}) {
  const columns = useColumns();
  const actions = useActions(data);
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
  );

  return (
    <DataTable
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
