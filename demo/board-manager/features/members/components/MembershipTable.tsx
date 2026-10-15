import { defineActions, defineColumns, useDataTableController } from '@local/data-table/react';
import { Anchor } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { fetchMemberships } from '../../../infra/in-memory/index.js';
import type { MembershipRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable, formatDate, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { openAction } from '../../../shared/ui/tableActions.js';

export { MembershipTable };

// The columns of a member's boards, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<MembershipRow>([
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
  ]);

// The actions of a member's boards: open the board (the default action).
const actionsOf = (t: Translate, navigate: NavigateFunction) =>
  defineActions<MembershipRow>([
    openAction((row) => navigate(`/boards/${row.boardId}`), { tip: t('members.openBoard') }),
  ]);

// The member's boards and roles, read-only: memberships are changed on the page of a board ("Open", also a double
// click, or the name).
function MembershipTable({ personId }: { personId: string }): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<MembershipRow>();
  const navigate = useNavigate();

  return (
    <DataTable
      controller={nav}
      title={t('modules.boards')}
      subtitle={t('members.boardsSubtitle')}
      density="compact"
      reloadable
      source={fetchMemberships(personId)}
      rowKey="id"
      columns={columnsOf(t)}
      actions={actionsOf(t, navigate)}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      footer="auto"
    />
  );
}
