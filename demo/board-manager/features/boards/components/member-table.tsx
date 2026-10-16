import { dateRangeFilter, useDataTableController } from '@local/data-table/react';
import type { TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { fetchBoardMembers } from '../../../infra/in-memory/index.js';
import type { MemberRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDate, PAGE_SIZE_OPTIONS, useReloadOnChange } from '../../../shared/shared.js';
import { deleteAction, editAction, newAction } from '../../../shared/ui/table-actions.js';
import { personFilter, roleFilter } from '../../members/member-filters.js';
import { organizationFilter } from '../../organizations/organization-filters.js';
import { useAddMemberFlow, useChangeRoleFlow, useRemoveMembersFlow } from '../flows/board-flows.js';

export { MemberTable };

function useColumns(): TableColumns<MemberRow> {
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

  return {
    name: personFilter,
    role: roleFilter(t),
    organization: organizationFilter,
    since: dateRangeFilter(),
  };
}

function useActions(boardId: string): TableActions<MemberRow> {
  const t = useTranslate();
  const addMember = useAddMemberFlow(boardId);
  const changeRole = useChangeRoleFlow();
  const removeMembers = useRemoveMembersFlow(boardId);

  return [
    newAction(t('boards.addMember'), addMember, { key: 'add' }),
    editAction(changeRole, { label: t('boards.changeRole'), default: true }),
    deleteAction(removeMembers, { key: 'remove', label: t('common.remove') }),
  ];
}

function MemberTable({ boardId }: { boardId: string }) {
  const t = useTranslate();
  const tableCtrl = useDataTableController<MemberRow>();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions(boardId);

  useReloadOnChange(tableCtrl);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('modules.members')}
      density="compact"
      searchable
      reloadable
      source={fetchBoardMembers(boardId)}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
    />
  );
}
