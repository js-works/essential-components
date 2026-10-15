import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  multiRowAction,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import { Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { STAGES } from '../../../domain/index.js';
import type { Candidate, HrData, Opening, Stage } from '../../../domain/index.js';
import { formatDate } from '../../../shared/lib/format.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { oneOf, within } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { Rating, StageBadge } from '../../../shared/ui/parts.js';
import { editAction, newAction } from '../../../shared/ui/tableActions.js';
import { useTableSource } from '../../hr/index.js';
import { candidateSourceFilter, stageFilter } from '../filters.js';
import { useRecruitingFlows } from '../flows.js';
import type { RecruitingFlows } from '../flows.js';

export { CandidateTable };

// The order of the stages when sorted: the pipeline's, the rejected last.
const STAGE_ORDER: Readonly<Record<Stage, number>> = Object.fromEntries(
  STAGES.map((stage, index) => [stage, index]),
) as Record<Stage, number>;

// The columns of an opening's candidates, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<Candidate>([
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
  ]);

// The filters of an opening's candidates.
const filtersOf = (t: Translate) =>
  defineFilters({ stage: stageFilter(t), source: candidateSourceFilter(t), applied: dateRangeFilter() });

// What the actions of an opening's candidates need: the flows, the opening, and the data (for the hire).
type CandidateContext = { flows: RecruitingFlows; opening: Opening; data: HrData };

// The actions of an opening's candidates: new, edit (the default action), hire, move the selected ones to a stage,
// reject them.
const actionsOf = (t: Translate, { flows, opening, data }: CandidateContext) =>
  defineActions<Candidate>([
    newAction(t('candidates.new'), () => flows.addCandidate(opening)),
    editAction((row) => flows.editCandidate(row), { default: true }),
    singleRowAction('hire', (row) => row.stage !== 'hired' && flows.hire(row, opening, data), {
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
        multiRowAction(`move-${stage}`, (rows: readonly Candidate[]) => flows.move(rows, stage), {
          label: t(`stage.${stage}`),
        })
      ),
    },
    multiRowAction('reject', (rows) => flows.move(rows, 'rejected'), {
      label: t('candidates.reject'),
      icon: appIcons.reject,
      variant: 'danger',
    }),
  ]);

// The candidates of an opening as a table: searched, filtered, sorted; the selected ones moved to a stage or rejected
// at once.
function CandidateTable({ data, opening }: { data: HrData; opening: Opening }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<Candidate>();
  const flows = useRecruitingFlows();
  const source = useTableSource<Candidate>(
    `candidates:${opening.id}`,
    (all) => all.candidates.filter((candidate) => candidate.openingId === opening.id),
    {
      search: ['name', 'email', 'note'],
      filters: {
        stage: (row, value) => oneOf(row.stage, value),
        source: (row, value) => oneOf(row.source, value),
        applied: (row, value) => within(row.applied, value),
      },
      sortValue: { stage: (row) => STAGE_ORDER[row.stage] },
    },
    nav.reload,
  );

  return (
    <DataTable
      controller={nav}
      source={source}
      rowKey="id"
      columns={columnsOf(t)}
      filters={filtersOf(t)}
      actions={actionsOf(t, { flows, opening, data })}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'stage', direction: 'asc' }}
    />
  );
}
