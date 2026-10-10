import { Anchor } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  dateRangeColumnFilter,
  textColumnFilter,
  useDataTableController,
} from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { createBoard, fetchBoards } from '../../../infra/in-memory';
import type { BoardRow } from '../../../infra/in-memory';
import { BoardForm } from '../../../shared/forms';
import { useTranslate } from '../../../shared/lib/i18n';
import type { Translate } from '../../../shared/lib/i18n';
import { appIcons, DataTable, formatDateTime, PAGE_SIZE_OPTIONS, personFilter } from '../../../shared/shared';
import { deleteBoardsFlow, editBoard } from '../components/boardFlows';

export { BoardsPage };

// The columns, with their headers in the current language.
const columnsOf = (t: Translate): readonly DataTableComponent.Column<BoardRow>[] => [
  {
    key: 'name',
    header: t('boards.columns.board'),
    width: 3,
    sortable: true,
    filter: textColumnFilter(),
    render: (row) => <Anchor component={Link} to={`/boards/${row.id}`} size="sm">{row.name}</Anchor>,
  },
  { key: 'description', header: t('boards.columns.description'), width: 4, hideable: true, hidden: true, wrap: true },
  { key: 'chair', header: t('boards.columns.chair'), width: 2, sortable: true, hideable: true, filter: personFilter },
  { key: 'members', header: t('boards.columns.members'), width: 1, sortable: true, hideable: true, align: 'end' },
  { key: 'meetings', header: t('boards.columns.meetings'), width: 1, sortable: true, hideable: true, align: 'end' },
  {
    key: 'nextMeeting',
    header: t('boards.columns.nextMeeting'),
    width: 2,
    sortable: true,
    hideable: true,
    filter: dateRangeColumnFilter(),
    render: (row) => formatDateTime(row.nextMeeting),
  },
];

// The "Boards" module: every board, with a new one, editing and deleting (with its meetings).
function BoardsPage(): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<BoardRow>();
  const columns = useMemo(() => columnsOf(t), [t]);
  const dialogs = useDialogs();
  const toasts = useToast();
  const navigate = useNavigate();

  const actions = useMemo<readonly DataTableComponent.Action<BoardRow>[]>(() => {
    const create = async () => {
      let created = '';
      const saved = !(await dialogs.form({
        title: t('boards.new'),
        content: (
          <BoardForm
            save={async (values) => {
              created = (await createBoard(values)).id;
            }}
          />
        ),
        buttons: { confirm: t('common.create') },
      })).canceled;

      if (saved) {
        toasts.success(t('boards.created'));
        navigate(`/boards/${created}`);
      }
    };

    const edit = async (row: BoardRow) => {
      if (await editBoard(dialogs, toasts, row.id)) {
        nav.reload();
      }
    };

    const remove = async (rows: readonly BoardRow[]) => {
      if (await deleteBoardsFlow(dialogs, toasts, rows)) {
        nav.reload();
      }
    };

    return [
      {
        type: 'general',
        key: 'new',
        label: t('boards.new'),
        icon: appIcons.add,
        variant: 'primary',
        onClick: () => void create(),
      },
      {
        type: 'singleRow',
        key: 'open',
        icon: appIcons.open,
        tip: t('common.open'),
        show: 'column',
        default: true,
        onClick: (row) => navigate(`/boards/${row.id}`),
      },
      {
        type: 'singleRow',
        key: 'edit',
        icon: appIcons.edit,
        label: t('common.edit'),
        show: 'both',
        onClick: (row) => void edit(row),
      },
      {
        type: 'multiRow',
        key: 'delete',
        label: t('common.delete'),
        icon: appIcons.remove,
        onClick: (rows) => void remove(rows),
      },
    ];
  }, [t, nav, dialogs, toasts, navigate]);

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
      columns={columns}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
