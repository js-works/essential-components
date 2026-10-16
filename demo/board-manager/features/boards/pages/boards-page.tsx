import { dateRangeFilter, textFilter, useDataTableController } from '@local/data-table/react';
import type { SavedFilter, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import { fetchBoards } from '../../../infra/in-memory/index.js';
import type { BoardRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDateTime, PAGE_SIZE_OPTIONS, useReloadOnChange } from '../../../shared/shared.js';
import { daysFromToday, sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { personFilter } from '../../members/member-filters.js';
import { useCreateBoardFlow, useDeleteBoardsFlow, useEditBoardFlow } from '../flows/board-flows.js';

export { BoardsPage };

function useColumns(): TableColumns<BoardRow> {
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

const filters: TableFilters = {
  name: textFilter(),
  chair: personFilter,
  nextMeeting: dateRangeFilter(),
};

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Committees', { name: { text: 'Committee', match: 'contains' } }),
  sharedBy('Jonas Weber', 'Meeting in the next 30 days', {
    nextMeeting: { from: daysFromToday(0), to: daysFromToday(30) },
  }),
];

function useActions(): TableActions<BoardRow> {
  const t = useTranslate();
  const navigate = useNavigate();
  const createBoard = useCreateBoardFlow();
  const editBoard = useEditBoardFlow();
  const deleteBoards = useDeleteBoardsFlow();

  return [
    newAction(t('boards.new'), createBoard),
    openAction((row) => navigate(`/boards/${row.id}`)),
    editAction((row) => editBoard(row.id)),
    deleteAction(deleteBoards),
  ];
}

// The "Boards" module: every board, with a new one, editing and deleting (with its meetings).
function BoardsPage() {
  const t = useTranslate();
  const tableCtrl = useDataTableController<BoardRow>();
  const columns = useColumns();
  const actions = useActions();
  const savedFilters = useSavedFilters('board-manager:saved-filters:boards', COLLEAGUES_FILTERS);

  useReloadOnChange(tableCtrl);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('modules.boards')}
      subtitle={t('boards.listSubtitle')}
      density="compact"
      searchable
      reloadable
      source={fetchBoards}
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
