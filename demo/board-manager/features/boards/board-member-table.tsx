import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, dateRangeFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { DataTable, useTableActions } from '@local/micro-app';

import type { Board, BoardMember, BoardMemberCriteria } from '../../domain/index.js';
import { BOARD_MEMBER_SORT_KEYS } from '../../domain/index.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { formatDate, PAGE_SIZE_OPTIONS } from '../../shared/shared.js';
import { useMemberService } from '../members/member-data.js';
import { personFilter, roleFilter } from '../members/member-filters.js';
import { useOrganizationService } from '../organizations/organization-data.js';
import { organizationFilter } from '../organizations/organization-filters.js';
import { useBoardService } from './board-data.js';
import { useAddMemberFlow, useChangeRoleFlow, useRemoveMembersFlow } from './board-flows.js';

export { BoardMemberTable };

function useSource(board: Board): RowSource<BoardMember> {
  const service = useBoardService();

  return useFindSource(
    ['boards', 'members', board.id],
    BOARD_MEMBER_SORT_KEYS,
    criteriaOf<BoardMemberCriteria>('text'),
    (...args) => service.findMembers(board.id, ...args),
  );
}

function useColumns(): TableColumns<BoardMember> {
  const t = useTranslate();

  return [
    { key: 'name', header: t('boards.columns.person'), width: 2.5, sortable: true },
    {
      key: 'role',
      header: t('boards.columns.role'),
      width: 1.5,
      sortable: true,
      render: (row) => t(`roles.${row.role}`),
    },
    {
      key: 'organization',
      header: t('boards.columns.organization'),
      width: 2.5,
      sortable: true,
      hideable: true,
    },
    { key: 'email', header: t('boards.columns.email'), width: 3, hideable: true, hidden: true },
    {
      key: 'since',
      header: t('boards.columns.memberSince'),
      width: 1.5,
      sortable: true,
      hideable: true,
      render: (row) => formatDate(row.since),
    },
  ];
}

function useFilters(): TableFilters {
  const t = useTranslate();
  const members = useMemberService();
  const organizations = useOrganizationService();

  return {
    names: { label: t('boards.columns.person'), filter: personFilter(members.suggest) },
    roles: { label: t('boards.columns.role'), filter: roleFilter(t) },
    organizations: { label: t('boards.columns.organization'), filter: organizationFilter(organizations.suggest) },
    since: dateRangeFilter(),
  };
}

function useActions(board: Board): TableActions<BoardMember> {
  const { deleteAction, editAction, newAction } = useTableActions();
  const t = useTranslate();
  const addMember = useAddMemberFlow(board.id);
  const changeRole = useChangeRoleFlow();
  const removeMembers = useRemoveMembersFlow(board.name);

  return [
    newAction(t('boards.addMember'), addMember, { key: 'add' }),
    editAction(changeRole, { label: t('boards.changeRole'), default: true }),
    deleteAction(removeMembers, { key: 'remove', label: t('common.remove') }),
  ];
}

function BoardMemberTable({ board }: { board: Board }) {
  const t = useTranslate();
  const source = useSource(board);
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(board);

  return (
    <DataTable
      title={t('modules.members')}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
    />
  );
}
