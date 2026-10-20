import { createFileRoute, useNavigate } from '@tanstack/react-router';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { BoardCriteria, BoardSummary } from '../../domain/index.js';
import { BOARD_SORT_KEYS } from '../../domain/index.js';
import { useBoardService } from '../../features/boards/board-data.js';
import { useBoardFlows } from '../../features/boards/board-flows.js';
import { useMemberService } from '../../features/members/member-data.js';
import { personFilter } from '../../features/members/member-filters.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { formatDateTime, PAGE_SIZE_OPTIONS } from '../../shared/shared.js';

export const Route = createFileRoute('/boards/')({ component: BoardTable });

function useSource(): RowSource<BoardSummary> {
  const service = useBoardService();

  return useFindSource(
    ['boards'],
    BOARD_SORT_KEYS,
    criteriaOf<BoardCriteria>('text'),
    service.find,
  );
}

function useColumns(): TableColumns<BoardSummary> {
  const t = useTranslate();

  return [
    {
      key: 'name',
      header: t('boards.columns.board'),
      width: 3,
      sortable: true,
      render: (row) => <AnchorLink to="/boards/$boardId" params={{ boardId: row.id }} size="sm">{row.name}</AnchorLink>,
    },
    { key: 'description', header: t('boards.columns.description'), width: 4, hideable: true, hidden: true, wrap: true },
    { key: 'chair', header: t('boards.columns.chair'), width: 2, sortable: true, hideable: true },
    { key: 'members', header: t('boards.columns.members'), width: 1, sortable: true, hideable: true, align: 'end' },
    { key: 'meetings', header: t('boards.columns.meetings'), width: 1, sortable: true, hideable: true, align: 'end' },
    {
      key: 'nextMeeting',
      header: t('boards.columns.nextMeeting'),
      width: 2,
      sortable: true,
      hideable: true,
      render: (row) => formatDateTime(row.nextMeeting),
    },
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();
  const members = useMemberService();

  return {
    name: textFilter(),
    chairs: { label: t('boards.columns.chair'), filter: personFilter(members.suggest) },
    nextMeeting: dateRangeFilter(),
  };
}

function useActions(): TableActions<BoardSummary> {
  const { deleteAction, editAction, newAction, openAction } = useTableActions();
  const t = useTranslate();
  const navigate = useNavigate();
  const flows = useBoardFlows();

  return [
    newAction(t('boards.new'), flows.create),
    openAction((row) => navigate({ to: '/boards/$boardId', params: { boardId: row.id } })),
    editAction(flows.edit),
    deleteAction(flows.remove),
  ];
}

function BoardTable() {
  const t = useTranslate();
  const source = useSource();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions();
  const savedFilters = useSavedTableFilters('boards');

  return (
    <DataTable
      title={t('modules.boards')}
      subtitle={t('boards.listSubtitle')}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
