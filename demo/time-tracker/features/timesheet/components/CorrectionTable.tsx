import { defineActions, defineColumns, multiRowAction, useDataTableController } from '@local/data-table/react';
import { Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { minutesOf } from '../../../domain/index.js';
import type { Correction, Employee, TimeData } from '../../../domain/index.js';
import { formatDate, formatDuration, formatStamp, formatTime } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { EmployeeLabel } from '../../../shared/ui/parts.js';
import { useTableSource } from '../../tracker/index.js';
import { useCorrectionFlows } from '../flows.js';
import type { CorrectionFlows } from '../flows.js';

export { CorrectionTable };

type CorrectionRow = Correction & { employee: Employee | undefined; employeeName: string; minutes: number };

// The columns of the corrections, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<CorrectionRow>([
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
  ]);

// The actions of the corrections: approve or reject the selected ones (`nameOf`: an employee's name, for the toast).
const actionsOf = (t: Translate, flows: CorrectionFlows, nameOf: (id: string) => string) =>
  defineActions<CorrectionRow>([
    multiRowAction('approve', (rows) => flows.decide(rows, 'approved', nameOf), {
      label: t('decision.approve'),
      icon: appIcons.approve,
    }),
    multiRowAction('reject', (rows) => flows.decide(rows, 'rejected', nameOf), {
      label: t('decision.reject'),
      icon: appIcons.reject,
      variant: 'danger',
    }),
  ]);

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
  const nameOf = (id: string) => data.employees.find((employee) => employee.id === id)?.name ?? '';

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

  return (
    <DataTable
      controller={nav}
      title={title}
      subtitle={subtitle}
      source={source}
      rowKey="id"
      columns={columnsOf(t)}
      actions={actionsOf(t, flows, nameOf)}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'date', direction: 'asc' }}
    />
  );
}
