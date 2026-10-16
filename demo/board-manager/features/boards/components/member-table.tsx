import { dateRangeFilter, useDataTableController } from '@local/data-table/react';
import type { RowQuery, RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import type {
  Board,
  BoardMember,
  BoardMemberCriteria,
  BoardMemberSortKey,
  Range,
  Role,
} from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { searchText, toPaging, toSort, usePageSource } from '../../../shared/lib/table-query.js';
import { DataTable, formatDate, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { deleteAction, editAction, newAction } from '../../../shared/ui/table-actions.js';
import { useMemberService } from '../../members/context.js';
import { personFilter, roleFilter } from '../../members/member-filters.js';
import { useOrganizationService } from '../../organizations/context.js';
import { organizationFilter } from '../../organizations/organization-filters.js';
import { useBoardService } from '../context.js';
import { useAddMemberFlow, useChangeRoleFlow, useRemoveMembersFlow } from '../flows/board-flows.js';
import { boardKeys } from '../keys.js';

export { MemberTable };

const SORT_KEYS: readonly BoardMemberSortKey[] = ['name', 'role', 'organization', 'since'];

function toCriteria(query: RowQuery): BoardMemberCriteria {
  const { name, role, organization, since } = query.filters as {
    name?: string[];
    role?: Role[];
    organization?: string[];
    since?: Range<string>;
  };

  return { text: searchText(query), names: name, roles: role, organizations: organization, since };
}

function useSource(boardId: string, reload: () => void): RowSource<BoardMember> {
  const service = useBoardService();

  return usePageSource(
    boardKeys.members(boardId),
    (query, signal) =>
      service.findMembers(boardId, toCriteria(query), toSort(query, SORT_KEYS), toPaging(query), signal),
    reload,
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
    name: personFilter(members.suggest),
    role: roleFilter(t),
    organization: organizationFilter(organizations.suggest),
    since: dateRangeFilter(),
  };
}

function useActions(board: Board): TableActions<BoardMember> {
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

function MemberTable({ board }: { board: Board }) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<BoardMember>();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(board);
  const source = useSource(board.id, tableCtrl.reload);

  return (
    <DataTable
      controller={tableCtrl}
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
