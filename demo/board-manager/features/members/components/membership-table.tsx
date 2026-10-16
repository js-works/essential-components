import { useDataTableController } from '@local/data-table/react';
import type { TableActions, TableColumns } from '@local/data-table/react';
import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import { fetchMemberships } from '../../../infra/in-memory/index.js';
import type { MembershipRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDate, PAGE_SIZE_OPTIONS, useReloadOnChange } from '../../../shared/shared.js';
import { openAction } from '../../../shared/ui/table-actions.js';

export { MembershipTable };

function useColumns(): TableColumns<MembershipRow> {
  const t = useTranslate();

  return [
    {
      key: 'board',
      header: t('members.columns.board'),
      width: 3,
      sortable: true,
      render: (row) => <Anchor component={Link} to={`/boards/${row.boardId}`} size="sm">{row.board}</Anchor>,
    },
    {
      key: 'role',
      header: t('members.columns.role'),
      width: 2,
      sortable: true,
      render: (row) => t(`roles.${row.role}`),
    },
    {
      key: 'since',
      header: t('members.columns.since'),
      width: 2,
      sortable: true,
      render: (row) => formatDate(row.since),
    },
  ];
}

function useActions(): TableActions<MembershipRow> {
  const t = useTranslate();
  const navigate = useNavigate();

  return [openAction((row) => navigate(`/boards/${row.boardId}`), { tip: t('members.openBoard') })];
}

// The member's boards and roles, read-only: memberships are changed on the page of a board ("Open", also a double
// click, or the name).
function MembershipTable({ personId }: { personId: string }) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<MembershipRow>();
  const columns = useColumns();
  const actions = useActions();

  useReloadOnChange(tableCtrl);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('modules.boards')}
      subtitle={t('members.boardsSubtitle')}
      density="compact"
      reloadable
      source={fetchMemberships(personId)}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      footer="auto"
    />
  );
}
