import { useNavigate } from '@tanstack/react-router';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { BoardCriteria, BoardSummary } from '../../../domain/index.js';
import { BOARD_SORT_KEYS } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { formatDateTime, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { useMemberService } from '../../members/context.js';
import { personFilter } from '../../members/member-filters.js';
import { useBoardService } from '../context.js';
import { useCreateBoardFlow, useDeleteBoardsFlow, useEditBoardFlow } from '../flows/board-flows.js';
import { boardKeys } from '../keys.js';

export { BoardTable };

function useSource(): RowSource<BoardSummary> {
  const service = useBoardService();

  return useFindSource(
    boardKeys.all,
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
  const createBoard = useCreateBoardFlow();
  const editBoard = useEditBoardFlow();
  const deleteBoards = useDeleteBoardsFlow();

  return [
    newAction(t('boards.new'), createBoard),
    openAction((row) => navigate({ to: '/boards/$boardId', params: { boardId: row.id } })),
    editAction(editBoard),
    deleteAction(deleteBoards),
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
