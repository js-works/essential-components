import { dateRangeFilter, textFilter, useDataTableController } from '@local/data-table/react';
import type {
  RowQuery,
  RowSource,
  SavedFilter,
  TableActions,
  TableColumns,
  TableFilters,
} from '@local/data-table/react';

import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import type { BoardCriteria, BoardSortKey, BoardSummary, Range, TextMatch } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { searchText, toPaging, toSort, usePageSource } from '../../../shared/lib/table-query.js';
import { DataTable, formatDateTime, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { daysFromToday, sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { useMemberService } from '../../members/context.js';
import { personFilter } from '../../members/member-filters.js';
import { useBoardService } from '../context.js';
import { useCreateBoardFlow, useDeleteBoardsFlow, useEditBoardFlow } from '../flows/board-flows.js';
import { boardKeys } from '../keys.js';

export { BoardsPage };

const SORT_KEYS: readonly BoardSortKey[] = ['name', 'chair', 'members', 'meetings', 'nextMeeting'];

function toCriteria(query: RowQuery): BoardCriteria {
  const { name, chair, nextMeeting } = query.filters as {
    name?: TextMatch;
    chair?: string[];
    nextMeeting?: Range<string>;
  };

  return { text: searchText(query), name, chairs: chair, nextMeeting };
}

function useSource(reload: () => void): RowSource<BoardSummary> {
  const service = useBoardService();

  return usePageSource(
    boardKeys.all,
    (query, signal) => service.find(toCriteria(query), toSort(query, SORT_KEYS), toPaging(query), signal),
    reload,
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
  const members = useMemberService();

  return {
    name: textFilter(),
    chair: personFilter(members.suggest),
    nextMeeting: dateRangeFilter(),
  };
}

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Committees', { name: { text: 'Committee', match: 'contains' } }),
  sharedBy('Jonas Weber', 'Meeting in the next 30 days', {
    nextMeeting: { from: daysFromToday(0), to: daysFromToday(30) },
  }),
];

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
function BoardsPage() {
  const t = useTranslate();
  const tableCtrl = useDataTableController<BoardSummary>();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions();
  const source = useSource(tableCtrl.reload);
  const savedFilters = useSavedFilters('board-manager:saved-filters:boards', COLLEAGUES_FILTERS);

  return (
    <DataTable
      controller={tableCtrl}
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
