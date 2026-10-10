import { Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import {
  dateRangeColumnFilter,
  selectColumnFilter,
  useDataTableController,
} from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { CANDIDATE_SOURCES, STAGES } from '../../../domain';
import type { Candidate, HrData, Opening, Stage } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { oneOf, within } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { appIcons } from '../../../shared/ui/icons';
import { Rating, StageBadge } from '../../../shared/ui/parts';
import { useTableSource } from '../../hr';
import { useRecruitingFlows } from '../flows';

export { CandidatesTable };

// The order of the stages when sorted: the pipeline's, the rejected last.
const STAGE_ORDER: Readonly<Record<Stage, number>> = Object.fromEntries(
  STAGES.map((stage, index) => [stage, index]),
) as Record<Stage, number>;

// The candidates of an opening as a table: searched, filtered, sorted; the selected ones moved to a stage or rejected
// at once.
function CandidatesTable({ data, opening }: { data: HrData; opening: Opening }): ReactElement {
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

  const columns = useMemo((): readonly DataTableComponent.Column<Candidate>[] => [
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
      filter: selectColumnFilter({
        options: STAGES.map((value) => ({ value, label: t(`stage.${value}`) })),
        multiple: true,
      }),
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
      filter: selectColumnFilter({
        options: CANDIDATE_SOURCES.map((value) => ({ value, label: t(`source.${value}`) })),
        multiple: true,
      }),
    },
    {
      key: 'applied',
      header: t('candidates.applied'),
      width: 1.3,
      sortable: true,
      render: (row) => formatDate(row.applied),
      filter: dateRangeColumnFilter(),
    },
    { key: 'note', header: t('candidates.note'), width: 2.4, hideable: true, hidden: true },
  ], [t]);

  const actions = useMemo((): readonly (
    | DataTableComponent.Action<Candidate>
    | DataTableComponent.ActionMenu<Candidate>
  )[] => [
    {
      type: 'general',
      key: 'new',
      label: t('candidates.new'),
      icon: appIcons.add,
      variant: 'primary',
      onClick: () => void flows.addCandidate(opening),
    },
    {
      type: 'singleRow',
      key: 'edit',
      icon: appIcons.edit,
      tip: t('common.edit'),
      show: 'both',
      default: true,
      onClick: (row) => void flows.editCandidate(row),
    },
    {
      type: 'singleRow',
      key: 'hire',
      label: t('hire.action'),
      icon: appIcons.hire,
      show: 'toolbar',
      onClick: (row) => row.stage !== 'hired' && void flows.hire(row, opening, data),
    },
    {
      type: 'menu',
      key: 'move',
      label: t('candidates.moveTo'),
      icon: appIcons.move,
      actions: (['applied', 'screening', 'interview', 'offer'] as const).map((stage) => ({
        type: 'multiRow' as const,
        key: `move-${stage}`,
        label: t(`stage.${stage}`),
        onClick: (rows: readonly Candidate[]) => void flows.move(rows, stage),
      })),
    },
    {
      type: 'multiRow',
      key: 'reject',
      label: t('candidates.reject'),
      icon: appIcons.reject,
      variant: 'danger',
      onClick: (rows) => void flows.move(rows, 'rejected'),
    },
  ], [t, flows, opening, data]);

  return (
    <DataTable
      controller={nav}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'stage', direction: 'asc' }}
    />
  );
}
