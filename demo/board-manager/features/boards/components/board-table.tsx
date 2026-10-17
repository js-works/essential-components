import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';

import type { BoardCriteria, BoardSummary } from '../../../domain/index.js';
import { BOARD_SORT_KEYS } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDateTime, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
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
      render: (row) => <Anchor component={Link} to={`/boards/${row.id}`} size="sm">{row.name}</Anchor>,
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
  const t = useTranslate();
  const navigate = useNavigate();
  const createBoard = useCreateBoardFlow();
  const editBoard = useEditBoardFlow();
  const deleteBoards = useDeleteBoardsFlow();

  return [
    newAction(t('boards.new'), createBoard),
    openAction((row) => navigate(`/boards/${row.id}`)),
    editAction(editBoard),
    deleteAction(deleteBoards),
  ];
}

// The "Boards" module: every board, with a new one, editing and deleting (with its meetings).
function BoardTable() {
  const t = useTranslate();
  const source = useSource();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions();
  const savedFilters = useSavedFilters('boards');

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
