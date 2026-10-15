import {
  defineActions,
  defineColumns,
  defineFilters,
  generalAction,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import type { TableColumn } from '@local/data-table/react';
import { Badge, Group, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { certificateRequired, sickDays, todayDate } from '../../../domain/index.js';
import type { Employee, SickNote } from '../../../domain/index.js';
import { formatDateRange, formatStamp } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { oneOf } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { EmployeeLabel } from '../../../shared/ui/parts.js';
import { editAction } from '../../../shared/ui/tableActions.js';
import { useTableSource } from '../../tracker/index.js';
import { certificateFilter } from '../filters.js';
import { useSickFlows } from '../flows.js';
import type { SickFlows } from '../flows.js';

export { SickTable };

type Certificate = 'uploaded' | 'missing' | 'notNeeded';

type SickRow = SickNote & {
  employee: Employee | undefined;
  employeeName: string;
  days: number;
  current: boolean;
  certificateState: Certificate;
};

// In the accent, like every pill (see `parts.tsx`): a missing note filled, one not needed gray.
const CERTIFICATE_PILLS: Readonly<Record<Certificate, { variant: 'filled' | 'light'; color?: 'gray' }>> = {
  uploaded: { variant: 'light' },
  missing: { variant: 'filled' },
  notNeeded: { variant: 'light', color: 'gray' },
};

function CertificateBadge({ row, t }: { row: SickRow; t: Translate }): ReactElement {
  return (
    <Badge {...CERTIFICATE_PILLS[row.certificateState]}>
      {t(`sick.certificate.${row.certificateState}`)}
    </Badge>
  );
}

// The columns of sick calls, with their headers in the current language (the employee only in a team's table).
const columnsOf = (t: Translate, mine: boolean) =>
  defineColumns<SickRow>([
    ...(mine ? [] : [
      {
        key: 'employeeName',
        header: t('sick.employee'),
        width: 3,
        sortable: true,
        render: (row) => row.employee === undefined ? row.employeeName : <EmployeeLabel employee={row.employee} />,
      } satisfies TableColumn<SickRow>,
    ]),
    {
      key: 'from',
      header: t('sick.period'),
      width: 3,
      sortable: true,
      render: (row) => (
        <Group gap={6} wrap="nowrap">
          <Text size="sm">{formatDateRange(row.from, row.to)}</Text>
          {row.current && <Badge size="xs" variant="filled">{t('sick.now')}</Badge>}
        </Group>
      ),
    },
    {
      key: 'days',
      header: t('sick.days'),
      width: 1,
      align: 'end',
      sortable: true,
    },
    {
      key: 'certificateState',
      header: t('sick.certificateColumn'),
      width: 2,
      sortable: true,
      render: (row) => <CertificateBadge row={row} t={t} />,
    },
    { key: 'note', header: t('sick.note'), width: 3, hideable: true },
    {
      key: 'reported',
      header: t('sick.reportedAt'),
      width: 2,
      sortable: true,
      hideable: true,
      render: (row) => formatStamp(row.reported),
    },
  ]);

// The filters of sick calls.
const filtersOf = (t: Translate) => defineFilters({ certificateState: certificateFilter(t) });

// The actions of the viewer's own sick calls (`self`): report one, change one (the default action), upload the doctor's
// note.
const actionsOf = (t: Translate, flows: SickFlows, self: Employee | undefined) =>
  defineActions<SickRow>([
    generalAction('report', () => self !== undefined && flows.report(self), {
      label: t('sick.report'),
      icon: appIcons.sick,
      variant: 'primary',
    }),
    editAction((row) => flows.edit(row), { default: true }),
    singleRowAction('certificate', (row) => flows.uploadCertificate(row), {
      icon: appIcons.upload,
      label: t('sick.uploadCertificate'),
      show: 'both',
    }),
  ]);

// Sick calls as a table: the viewer's own (`mine`: report, change, upload the doctor's note) or those of employees (a
// team lead: to see who is sick and whose doctor's note is missing).
function SickTable({ employees, mine, title, subtitle }: {
  employees: readonly Employee[];
  mine: boolean;
  title: string;
  subtitle?: string;
}): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<SickRow>();
  const flows = useSickFlows();
  const ids = employees.map((employee) => employee.id);

  const source = useTableSource<SickRow>(`sick:${ids.join(',')}`, (data) => {
    const today = todayDate();

    return data.sick
      .filter((note) => ids.includes(note.employeeId))
      .map((note) => {
        const employee = data.employees.find((candidate) => candidate.id === note.employeeId);

        return {
          ...note,
          employee,
          employeeName: employee?.name ?? '',
          days: sickDays(note),
          current: note.from <= today && today <= note.to,
          certificateState: note.certificate !== null
            ? 'uploaded'
            : certificateRequired(note)
            ? 'missing'
            : 'notNeeded',
        };
      });
  }, {
    search: ['employeeName', 'note'],
    filters: { certificateState: (row, value) => oneOf(row.certificateState, value) },
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
      actions={mine ? actionsOf(t, flows, employees[0]) : undefined}
      rowActionLook="icon"
      searchable={!mine}
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'from', direction: 'desc' }}
    />
  );
}
