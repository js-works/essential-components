import { useNavigate } from '@tanstack/react-router';

import type { RowSource, TableActions, TableColumns } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useTableActions } from '@local/micro-app';

import type { PersonMembership } from '../../domain/index.js';
import { PERSON_MEMBERSHIP_SORT_KEYS } from '../../domain/index.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { formatDate, PAGE_SIZE_OPTIONS } from '../../shared/shared.js';
import { useMemberService } from './member-data.js';

export { MembershipTable };

function useSource(personId: string): RowSource<PersonMembership> {
  const service = useMemberService();

  return useFindSource(
    ['people', 'boards', personId],
    PERSON_MEMBERSHIP_SORT_KEYS,
    (query) => query.search.trim() || undefined,
    (...args) => service.findMemberships(personId, ...args),
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
      render: (row) => (
        <AnchorLink to="/boards/$boardId" params={{ boardId: row.boardId }} size="sm">{row.board}</AnchorLink>
      ),
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
  const { openAction } = useTableActions();
  const t = useTranslate();
  const navigate = useNavigate();

  return [
    openAction((row) => navigate({ to: '/boards/$boardId', params: { boardId: row.boardId } }), {
      tip: t('members.openBoard'),
    }),
  ];
}

function MembershipTable({ personId }: { personId: string }) {
  const t = useTranslate();
  const source = useSource(personId);
  const columns = useColumns();
  const actions = useActions();

  return (
    <DataTable
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
