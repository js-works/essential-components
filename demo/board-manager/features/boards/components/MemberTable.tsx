import {
  dateRangeFilter,
  defineActions,
  defineColumns,
  defineFilters,
  useDataTableController,
} from '@local/data-table/react';
import { useDialogs, useToast } from '@local/overlays/react';
import type { ReactElement } from 'react';
import { fetchBoardMembers } from '../../../infra/in-memory/index.js';
import type { MemberRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDate, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { deleteAction, editAction, newAction } from '../../../shared/ui/tableActions.js';
import { personFilter, roleFilter } from '../../members/filters.js';
import { organizationFilter } from '../../organizations/filters.js';
import { addMemberFlow, changeRoleFlow, removeMembersFlow } from './memberFlows.js';
import type { MemberContext } from './memberFlows.js';

export { MemberTable };

// The columns of the members table, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<MemberRow>([
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
  ]);

// The filters of the members table.
const filtersOf = (t: Translate) =>
  defineFilters({
    name: personFilter,
    role: roleFilter(t),
    organization: organizationFilter,
    since: dateRangeFilter(),
  });

// The actions of the members table: add a member, change a role (the default action), remove.
const actionsOf = (t: Translate, ctx: MemberContext) =>
  defineActions<MemberRow>([
    newAction(t('boards.addMember'), () => addMemberFlow(ctx), { key: 'add' }),
    editAction((row) => changeRoleFlow(ctx, row), { label: t('boards.changeRole'), default: true }),
    deleteAction((rows) => removeMembersFlow(ctx, rows), { key: 'remove', label: t('common.remove') }),
  ]);

// The members of a board: add one (of the people who are not on it yet), change a role, remove.
function MemberTable({ boardId }: { boardId: string }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<MemberRow>();
  const ctx = { dialogs: useDialogs(), toasts: useToast(), nav, boardId };
  const source = fetchBoardMembers(boardId);

  return (
    <DataTable
      controller={nav}
      title={t('modules.members')}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columnsOf(t)}
      filters={filtersOf(t)}
      actions={actionsOf(t, ctx)}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
    />
  );
}
