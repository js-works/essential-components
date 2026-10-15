import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  useDataTableController,
} from '@local/data-table/react';
import type { SavedFilter } from '@local/data-table/react';
import { Anchor, Loader, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { isInProcess } from '../../../domain/index.js';
import type { HrData, Opening, OpeningStatus } from '../../../domain/index.js';
import { formatDate } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { oneOf, within } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { OpeningStatusBadge } from '../../../shared/ui/parts.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { departmentFilter } from '../../departments/index.js';
import { departmentName, employeeOf, useHrData, useTableSource } from '../../hr/index.js';
import { openingStatusFilter } from '../filters.js';
import { useRecruitingFlows } from '../flows.js';
import type { RecruitingFlows } from '../flows.js';

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

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Tom Becker', 'Open positions', { status: ['open'] }),
  sharedBy('Sophie Brandt', 'Sales openings', { department: ['Sales', 'Sales DACH', 'International Sales'] }),
];

// The columns of the openings, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<OpeningRow>([
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
    },
    {
      key: 'status',
      header: t('openings.status'),
      width: 1.3,
      sortable: true,
      render: (row) => <OpeningStatusBadge status={row.status} />,
    },
  ]);

// The filters of the openings (the departments: those of the data).
const filtersOf = (t: Translate, data: HrData) =>
  defineFilters({
    department: departmentFilter(data.departments),
    opened: dateRangeFilter(),
    status: openingStatusFilter(t),
  });

// The actions of the openings: new, open (the default action), edit.
const actionsOf = (t: Translate, flows: RecruitingFlows, navigate: NavigateFunction, data: HrData) =>
  defineActions<OpeningRow>([
    newAction(t('openings.new'), () => flows.createOpening(data)),
    openAction((row) => navigate(`/recruiting/${row.id}`)),
    editAction((row) => flows.editOpening(row, data)),
  ]);

// The job openings: their department, hiring manager, status and candidates. Open one for its pipeline.
function RecruitingPage(): ReactElement {
  const t = useTranslate();
  const data = useHrData();
  const nav = useDataTableController<OpeningRow>();
  const flows = useRecruitingFlows();
  const navigate = useNavigate();
  const savedFilters = useSavedFilters('human-resources:saved-filters:openings', COLLEAGUES_FILTERS);
  const source = useTableSource<OpeningRow>('openings', openingRows, {
    search: ['title', 'department', 'manager', 'location'],
    filters: {
      department: (row, value) => oneOf(row.department, value),
      status: (row, value) => oneOf(row.status, value),
      opened: (row, value) => within(row.opened, value),
    },
    sortValue: { status: (row) => STATUS_ORDER[row.status] },
  }, nav.reload);

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
      columns={columnsOf(t)}
      filters={filtersOf(t, data)}
      actions={actionsOf(t, flows, navigate, data)}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'status', direction: 'asc' }}
    />
  );
}
