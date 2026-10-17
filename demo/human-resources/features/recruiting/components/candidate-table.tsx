import { Text } from '@mantine/core';

import type { TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { dateRangeFilter, multiRowAction, singleRowAction } from '@local/data-table/react';
import { DataTable, useTableActions } from '@local/micro-app';

import type { Candidate, HrData, Opening, Stage } from '../../../domain/index.js';
import { STAGES } from '../../../domain/index.js';
import { formatDate } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { Rating, StageBadge } from '../../../shared/ui/parts.js';
import { useTableSource } from '../../hr/index.js';
import { candidateSourceFilter, stageFilter } from '../recruiting-filters.js';
import { useAddCandidateFlow, useEditCandidateFlow, useHireFlow, useMoveCandidatesFlow } from '../recruiting-flows.js';

export { CandidateTable };

// The order of the stages when sorted: the pipeline's, the rejected last.
const STAGE_ORDER: Readonly<Record<Stage, number>> = Object.fromEntries(
  STAGES.map((stage, index) => [stage, index]),
) as Record<Stage, number>;

function useColumns(): TableColumns<Candidate> {
  const t = useTranslate();

  return [
    {
      key: 'name',
      header: t('candidates.name'),
      width: 2.4,
      sortable: true,
      render: (row) => (
        <div style={{ minWidth: 0 }}>
          <Text size="sm" truncate>{row.name}</Text>
          <Text size="xs" c="dimmed" truncate>{row.email}</Text>
        </div>
      ),
    },
    {
      key: 'stage',
      header: t('candidates.stage'),
      width: 1.4,
      sortable: true,
      render: (row) => <StageBadge stage={row.stage} />,
    },
    {
      key: 'rating',
      header: t('candidates.rating'),
      width: 1.2,
      sortable: true,
      render: (row) => <Rating value={row.rating} />,
    },
    {
      key: 'source',
      header: t('candidates.source'),
      width: 1.3,
      sortable: true,
      hideable: true,
      render: (row) => t(`source.${row.source}`),
    },
    {
      key: 'applied',
      header: t('candidates.applied'),
      width: 1.3,
      sortable: true,
      render: (row) => formatDate(row.applied),
    },
    { key: 'note', header: t('candidates.note'), width: 2.4, hideable: true, hidden: true },
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();

  return { stage: stageFilter(t), source: candidateSourceFilter(t), applied: dateRangeFilter() };
}

function useActions(opening: Opening, data: HrData): TableActions<Candidate> {
  const { editAction, newAction } = useTableActions();
  const t = useTranslate();
  const addCandidate = useAddCandidateFlow();
  const editCandidate = useEditCandidateFlow();
  const moveCandidates = useMoveCandidatesFlow();
  const hire = useHireFlow();

  return [
    newAction(t('candidates.new'), () => addCandidate(opening)),
    editAction((row) => editCandidate(row), { default: true }),
    singleRowAction('hire', (row) => row.stage !== 'hired' && hire(row, opening, data), {
      label: t('hire.action'),
      icon: appIcons.hire,
      show: 'toolbar',
    }),
    {
      type: 'menu',
      key: 'move',
      label: t('candidates.moveTo'),
      icon: appIcons.move,
      actions: (['applied', 'screening', 'interview', 'offer'] as const).map((stage) =>
        multiRowAction(`move-${stage}`, (rows: readonly Candidate[]) => moveCandidates(rows, stage), {
          label: t(`stage.${stage}`),
        })
      ),
    },
    multiRowAction('reject', (rows) => moveCandidates(rows, 'rejected'), {
      label: t('candidates.reject'),
      icon: appIcons.reject,
      variant: 'danger',
    }),
  ];
}

function CandidateTable({ data, opening }: { data: HrData; opening: Opening }) {
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(opening, data);
  const source = useTableSource<Candidate>(
    `candidates:${opening.id}`,
    (all) => all.candidates.filter((candidate) => candidate.openingId === opening.id),
    {
      search: ['name', 'email', 'note'],
      sortValue: { stage: (row) => STAGE_ORDER[row.stage] },
    },
  );

  return (
    <DataTable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'stage', direction: 'asc' }}
    />
  );
}
