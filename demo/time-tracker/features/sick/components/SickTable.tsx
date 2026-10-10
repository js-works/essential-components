import { Badge, Group, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { selectColumnFilter, useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { certificateRequired, sickDays, todayDate } from '../../../domain';
import type { Employee, SickNote } from '../../../domain';
import { formatDateRange, formatStamp } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import type { Translate } from '../../../shared/lib/i18n';
import { oneOf } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeLabel } from '../../../shared/ui/parts';
import { useTableSource } from '../../tracker';
import { useSickFlows } from '../flows';

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
  const self = employees[0];

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

  const columns = useMemo((): readonly DataTableComponent.Column<SickRow>[] => {
    const employeeColumn: DataTableComponent.Column<SickRow> = {
      key: 'employeeName',
      header: t('sick.employee'),
      width: 3,
      sortable: true,
      render: (row) => row.employee === undefined ? row.employeeName : <EmployeeLabel employee={row.employee} />,
    };

    return [
      ...(mine ? [] : [employeeColumn]),
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
        filter: selectColumnFilter({
          options: (['uploaded', 'missing', 'notNeeded'] as const).map((value) => ({
            value,
            label: t(`sick.certificate.${value}`),
          })),
          multiple: true,
        }),
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
  }, [mine, t]);

  const actions = useMemo((): readonly DataTableComponent.Action<SickRow>[] =>
    mine
      ? [
        {
          type: 'general',
          key: 'report',
          label: t('sick.report'),
          icon: appIcons.sick,
          variant: 'primary',
          onClick: () => self !== undefined && void flows.report(self),
        },
        {
          type: 'singleRow',
          key: 'edit',
          icon: appIcons.edit,
          tip: t('common.edit'),
          show: 'both',
          default: true,
          onClick: (row) => void flows.edit(row),
        },
        {
          type: 'singleRow',
          key: 'certificate',
          icon: appIcons.upload,
          label: t('sick.uploadCertificate'),
          show: 'both',
          onClick: (row) => void flows.uploadCertificate(row),
        },
      ]
      : [], [mine, t, flows, self]);

  return (
    <DataTable
      controller={nav}
      title={title}
      subtitle={subtitle}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      rowActionLook="icon"
      searchable={!mine}
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'from', direction: 'desc' }}
    />
  );
}
