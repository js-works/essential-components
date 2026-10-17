import { Badge, Group, Text } from '@mantine/core';

import type { TableActions, TableColumn, TableColumns, TableFilters } from '@local/data-table/react';
import { generalAction, singleRowAction } from '@local/data-table/react';

import type { Employee, SickNote } from '../../../domain/index.js';
import { certificateRequired, sickDays, todayDate } from '../../../domain/index.js';
import { formatDateRange, formatStamp } from '../../../shared/lib/format.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { EmployeeLabel } from '../../../shared/ui/parts.js';
import { editAction } from '../../../shared/ui/table-actions.js';
import { useTableSource } from '../../tracker/index.js';
import { certificateFilter } from '../sick-filters.js';
import { useEditSickNoteFlow, useReportSickFlow, useUploadCertificateFlow } from '../sick-flows.js';

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

function CertificateBadge({ row, t }: { row: SickRow; t: Translate }) {
  return (
    <Badge {...CERTIFICATE_PILLS[row.certificateState]}>
      {t(`sick.certificate.${row.certificateState}`)}
    </Badge>
  );
}

function useColumns(mine: boolean): TableColumns<SickRow> {
  const t = useTranslate();

  return [
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
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();

  return { certificateState: certificateFilter(t) };
}

function useActions(mine: boolean, self: Employee | undefined): TableActions<SickRow> {
  const t = useTranslate();
  const reportSick = useReportSickFlow();
  const editSickNote = useEditSickNoteFlow();
  const uploadCertificate = useUploadCertificateFlow();

  return mine
    ? [
      generalAction('report', () => self !== undefined && reportSick(self), {
        label: t('sick.report'),
        icon: appIcons.sick,
        variant: 'primary',
      }),
      editAction(editSickNote, { default: true }),
      singleRowAction('certificate', uploadCertificate, {
        icon: appIcons.upload,
        label: t('sick.uploadCertificate'),
        show: 'both',
      }),
    ]
    : [];
}

// Sick calls as a table: the viewer's own (`mine`: report, change, upload the doctor's note) or those of employees (a
// team lead: to see who is sick and whose doctor's note is missing).
function SickTable({ employees, mine, title, subtitle }: {
  employees: readonly Employee[];
  mine: boolean;
  title: string;
  subtitle?: string;
}) {
  const columns = useColumns(mine);
  const filters = useFilters();
  const actions = useActions(mine, employees[0]);
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
  });

  return (
    <DataTable
      title={title}
      subtitle={subtitle}
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      rowActionLook="icon"
      searchable={!mine}
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'from', direction: 'desc' }}
    />
  );
}
