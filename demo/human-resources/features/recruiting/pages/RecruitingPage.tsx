import { Anchor, Loader, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataTableController,
} from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { isInProcess, OPENING_STATUSES } from '../../../domain';
import type { HrData, Opening, OpeningStatus } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { oneOf, within } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { OpeningStatusBadge } from '../../../shared/ui/parts';
import { departmentName, employeeOf, useHrData, useTableSource } from '../../hr';
import { useRecruitingFlows } from '../flows';

export { RecruitingPage };

type OpeningRow = Opening & {
  department: string;
  manager: string;
  inProcess: number;
  candidates: number;
  hired: number;
};

function openingRows(data: HrData): OpeningRow[] {
  return data.openings.map((opening) => {
    const candidates = data.candidates.filter((candidate) => candidate.openingId === opening.id);

    return {
      ...opening,
      department: departmentName(data, opening.departmentId),
      manager: employeeOf(data, opening.hiringManagerId)?.name ?? '',
      inProcess: candidates.filter(isInProcess).length,
      candidates: candidates.length,
      hired: candidates.filter((candidate) => candidate.stage === 'hired').length,
    };
  });
}

// The order of the states when sorted: the open ones first.
const STATUS_ORDER: Readonly<Record<OpeningStatus, number>> = { open: 0, onHold: 1, closed: 2 };

// The job openings: their department, hiring manager, status and candidates. Open one for its pipeline.
function RecruitingPage(): ReactElement {
  const t = useTranslate();
  const data = useHrData();
  const nav = useDataTableController<OpeningRow>();
  const navigate = useNavigate();
  const flows = useRecruitingFlows();
  const source = useTableSource<OpeningRow>('openings', openingRows, {
    search: ['title', 'department', 'manager', 'location'],
    filters: {
      department: (row, value) => oneOf(row.department, value),
      status: (row, value) => oneOf(row.status, value),
      opened: (row, value) => within(row.opened, value),
    },
    sortValue: { status: (row) => STATUS_ORDER[row.status] },
  }, nav.reload);
  const departments = data?.departments;

  const columns = useMemo((): readonly DataTableComponent.Column<OpeningRow>[] => [
    {
      key: 'title',
      header: t('openings.position'),
      width: 3,
      sortable: true,
      render: (row) => (
        <div style={{ minWidth: 0 }}>
          <Anchor component={Link} to={`/recruiting/${row.id}`} size="sm" truncate display="block">{row.title}</Anchor>
          <Text size="xs" c="dimmed" truncate>
            {[row.location, t(`employmentType.${row.employmentType}`)].filter(Boolean).join(' · ')}
          </Text>
        </div>
      ),
    },
    {
      key: 'department',
      header: t('openings.department'),
      width: 2,
      sortable: true,
      filter: selectColumnFilter({
        options: [...(departments ?? [])]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((department) => ({ value: department.name, label: department.name })),
        multiple: true,
      }),
    },
    { key: 'manager', header: t('openings.hiringManager'), width: 2, sortable: true, hideable: true },
    {
      key: 'inProcess',
      header: t('openings.inProcess'),
      width: 1.2,
      align: 'end',
      sortable: true,
    },
    {
      key: 'hired',
      header: t('openings.filled'),
      width: 1.2,
      align: 'end',
      sortable: true,
      hideable: true,
      render: (row) => `${row.hired} / ${row.positions}`,
    },
    {
      key: 'opened',
      header: t('openings.opened'),
      width: 1.4,
      sortable: true,
      hideable: true,
      render: (row) => formatDate(row.opened),
      filter: dateRangeColumnFilter(),
    },
    {
      key: 'status',
      header: t('openings.status'),
      width: 1.3,
      sortable: true,
      render: (row) => <OpeningStatusBadge status={row.status} />,
      filter: selectColumnFilter({
        options: OPENING_STATUSES.map((value) => ({ value, label: t(`openingStatus.${value}`) })),
        multiple: true,
      }),
    },
  ], [t, departments]);

  const actions = useMemo((): readonly DataTableComponent.Action<OpeningRow>[] => [
    {
      type: 'general',
      key: 'new',
      label: t('openings.new'),
      icon: appIcons.add,
      variant: 'primary',
      onClick: () => data !== undefined && void flows.createOpening(data),
    },
    {
      type: 'singleRow',
      key: 'open',
      icon: appIcons.open,
      tip: t('common.open'),
      show: 'column',
      default: true,
      onClick: (row) => void navigate(`/recruiting/${row.id}`),
    },
    {
      type: 'singleRow',
      key: 'edit',
      icon: appIcons.edit,
      tip: t('common.edit'),
      show: 'both',
      onClick: (row) => data !== undefined && void flows.editOpening(row, data),
    },
  ], [t, flows, navigate, data]);

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <DataTable
      controller={nav}
      title={t('openings.title')}
      subtitle={t('openings.subtitle')}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'status', direction: 'asc' }}
    />
  );
}
