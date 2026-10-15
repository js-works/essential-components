import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  textFilter,
  useDataTableController,
} from '@local/data-table/react';
import type { SavedFilter } from '@local/data-table/react';
import { useDialogs, useToast } from '@local/overlays/react';
import { Anchor } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { fetchBoards } from '../../../infra/in-memory/index.js';
import type { BoardRow } from '../../../infra/in-memory/index.js';
import type { TableContext } from '../../../shared/lib/flows.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDateTime, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { daysFromToday, sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { personFilter } from '../../members/filters.js';
import { createBoardFlow, deleteBoardsFlow, editBoard } from '../components/boardFlows.js';

export { BoardsPage };

// The columns of the boards list, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<BoardRow>([
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
  ]);

// The filters (none of them has texts of its own).
const filters = defineFilters({
  name: textFilter(),
  chair: personFilter,
  nextMeeting: dateRangeFilter(),
});

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Committees', { name: { text: 'Committee', match: 'contains' } }),
  sharedBy('Jonas Weber', 'Meeting in the next 30 days', {
    nextMeeting: { from: daysFromToday(0), to: daysFromToday(30) },
  }),
];

// What the actions of the boards list need: the table's context, and where a board opens.
type BoardListContext = TableContext<BoardRow> & { navigate: NavigateFunction };

// The actions of the boards list: new, open (the default action), edit, delete (with its meetings).
const actionsOf = (t: Translate, ctx: BoardListContext) =>
  defineActions<BoardRow>([
    newAction(t('boards.new'), () => createBoardFlow(ctx)),
    openAction((row) => ctx.navigate(`/boards/${row.id}`)),
    editAction(async (row) => (await editBoard(ctx.dialogs, ctx.toasts, row.id)) && ctx.nav.reload()),
    deleteAction(async (rows) => (await deleteBoardsFlow(ctx.dialogs, ctx.toasts, rows)) && ctx.nav.reload()),
  ]);

// The "Boards" module: every board, with a new one, editing and deleting (with its meetings).
function BoardsPage(): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<BoardRow>();
  const ctx = { dialogs: useDialogs(), toasts: useToast(), nav, navigate: useNavigate() };
  const savedFilters = useSavedFilters('board-manager:saved-filters:boards', COLLEAGUES_FILTERS);

  return (
    <DataTable
      controller={nav}
      title={t('modules.boards')}
      subtitle={t('boards.listSubtitle')}
      density="compact"
      searchable
      reloadable
      source={fetchBoards}
      rowKey="id"
      columns={columnsOf(t)}
      filters={filters}
      actions={actionsOf(t, ctx)}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
