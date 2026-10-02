import { Anchor } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  dateRangeColumnFilter,
  textColumnFilter,
  useDataNavigatorController,
} from '../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../packages/overlays/src/main/bindings/react';
import { createBoard, db, deleteBoards, fetchBoards, getBoard, updateBoard } from '../db';
import type { BoardRow } from '../db';
import { confirmAndRun } from '../flows';
import { BoardForm } from '../forms';
import { appIcons, countText, formatDateTime, Navigator, personFilter } from '../shared';

export { BoardsPage };

const columns: readonly DataNavigatorComponent.Column<BoardRow>[] = [
  {
    key: 'name',
    header: 'Board',
    width: 3,
    sortable: true,
    filter: textColumnFilter(),
    render: (row) => <Anchor component={Link} to={`/boards/${row.id}`} size="sm">{row.name}</Anchor>,
  },
  { key: 'description', header: 'Description', width: 4, hideable: true, hidden: true, wrap: true },
  { key: 'chair', header: 'Chair', width: 2, sortable: true, hideable: true, filter: personFilter },
  { key: 'members', header: 'Members', width: 1, sortable: true, hideable: true, align: 'end' },
  { key: 'meetings', header: 'Meetings', width: 1, sortable: true, hideable: true, align: 'end' },
  {
    key: 'nextMeeting',
    header: 'Next meeting',
    width: 2,
    sortable: true,
    hideable: true,
    filter: dateRangeColumnFilter(),
    render: (row) => formatDateTime(row.nextMeeting),
  },
];

// The "Boards" module: every board, with a new one, editing and deleting (with its meetings).
function BoardsPage(): ReactElement {
  const nav = useDataNavigatorController<BoardRow>();
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();

  const actions = useMemo<readonly DataNavigatorComponent.Action<BoardRow>[]>(() => {
    const create = async () => {
      let created = '';
      const saved = !(await dialogs.form({
        title: 'New board',
        content: (
          <BoardForm
            save={async (values) => {
              created = (await createBoard(values)).id;
            }}
          />
        ),
        buttons: { confirm: 'Create' },
      })).canceled;

      if (saved) {
        toasts.success('Board created');
        navigate(`/boards/${created}`);
      }
    };

    const edit = async (row: BoardRow) => {
      const board = getBoard(db.getState(), row.id);
      const saved = !(await dialogs.form({
        title: 'Edit board',
        content: <BoardForm board={board} save={(values) => updateBoard(row.id, values)} />,
        buttons: { confirm: 'Save' },
      })).canceled;

      if (saved) {
        nav.reload();
        toasts.success(`"${currentName(row)}" saved`);
      }
    };

    const remove = async (rows: readonly BoardRow[]) => {
      const [first] = rows;
      const single = rows.length === 1 && first !== undefined;
      const meetings = rows.reduce((sum, row) => sum + row.meetings, 0);
      const done = await confirmAndRun(
        dialogs,
        {
          title: single ? 'Delete board' : 'Delete boards',
          content: `${
            single ? `Delete "${first.name}"` : `Delete the ${rows.length} selected boards`
          }, with ${meetings} meetings, their agendas, minutes and documents?\nThis cannot be undone.`,
          buttons: { confirm: 'Delete' },
        },
        () => deleteBoards(rows.map((row) => row.id)),
      );

      if (done) {
        nav.reload();
        toasts.success(`${countText(rows.map((row) => row.name), 'boards')} deleted`);
      }
    };

    return [
      { type: 'general', key: 'new', label: 'New board', icon: appIcons.add, onClick: () => void create() },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: 'Open',
        show: 'column',
        default: true,
        onClick: (row) => navigate(`/boards/${row.id}`),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: 'Edit',
        show: 'both',
        onClick: (row) => void edit(row),
      },
      { type: 'multiRow', key: 'delete', label: 'Delete', icon: appIcons.remove, onClick: (rows) => void remove(rows) },
    ];
  }, [nav, dialogs, toasts, navigate]);

  return (
    <Navigator
      controller={nav}
      title="Boards"
      subtitle="The boards and committees. Open one for its meetings and members."
      density="compact"
      searchable
      reloadable
      source={fetchBoards}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSize={10}
      pageSizeOptions={[10, 25]}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}

// The name of a board after a save (the row still has the old one).
function currentName(row: BoardRow): string {
  return getBoard(db.getState(), row.id)?.name ?? row.name;
}
