import { useDataTableController } from '@local/data-table/react';
import type { RowSource, TableActions, TableColumns } from '@local/data-table/react';
import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import type { PersonMembership, PersonMembershipSortKey } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { searchText, toPaging, toSort, usePageSource } from '../../../shared/lib/table-query.js';
import { DataTable, formatDate, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { openAction } from '../../../shared/ui/table-actions.js';
import { useMemberService } from '../context.js';
import { memberKeys } from '../keys.js';

export { MembershipTable };

const SORT_KEYS: readonly PersonMembershipSortKey[] = ['board', 'role', 'since'];

function useSource(personId: string, reload: () => void): RowSource<PersonMembership> {
  const service = useMemberService();

  return usePageSource(
    memberKeys.boards(personId),
    (query, signal) =>
      service.findMemberships(personId, searchText(query), toSort(query, SORT_KEYS), toPaging(query), signal),
    reload,
  );
}

function useColumns(): TableColumns<PersonMembership> {
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

function useActions(): TableActions<PersonMembership> {
  const t = useTranslate();
  const navigate = useNavigate();

  return [openAction((row) => navigate(`/boards/${row.boardId}`), { tip: t('members.openBoard') })];
}

// The member's boards and roles, read-only: memberships are changed on the page of a board ("Open", also a double
// click, or the name).
function MembershipTable({ personId }: { personId: string }) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<PersonMembership>();
  const columns = useColumns();
  const actions = useActions();
  const source = useSource(personId, tableCtrl.reload);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('modules.boards')}
      subtitle={t('members.boardsSubtitle')}
      density="compact"
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      footer="auto"
    />
  );
}
