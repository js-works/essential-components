import { useDataTableController } from '@local/data-table/react';
import type {
  RowQuery,
  RowSource,
  SavedFilter,
  TableActions,
  TableColumns,
  TableFilters,
} from '@local/data-table/react';

import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import type { PersonCriteria, PersonSortKey, PersonSummary } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { searchText, toPaging, toSort, usePageSource } from '../../../shared/lib/table-query.js';
import { DataTable, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { boardFilter } from '../../boards/filters/board-filters.js';
import { useBoardList } from '../../boards/reads.js';
import { useOrganizationService } from '../../organizations/context.js';
import { organizationFilter } from '../../organizations/organization-filters.js';
import { useMemberService } from '../context.js';
import { memberKeys } from '../keys.js';
import { personFilter } from '../member-filters.js';
import { useCreatePersonFlow, useDeletePeopleFlow, useEditPersonFlow } from '../member-flows.js';

export { memberPath, PersonTable };

const SORT_KEYS: readonly PersonSortKey[] = ['name', 'organization'];

function toCriteria(query: RowQuery, organizationId: string | undefined): PersonCriteria {
  const { name, organization, boards } = query.filters as {
    name?: string[];
    organization?: string[];
    boards?: string[];
  };

  return { text: searchText(query), names: name, organizations: organization, boards, organizationId };
}

function useSource(organizationId: string | undefined, reload: () => void): RowSource<PersonSummary> {
  const service = useMemberService();

  return usePageSource(
    [...memberKeys.all, 'people', organizationId ?? ''],
    (query, signal) =>
      service.find(toCriteria(query, organizationId), toSort(query, SORT_KEYS), toPaging(query), signal),
    reload,
  );
}

// A member's page.
const memberPath = (person: { id: string }) => `/members/${person.id}`;

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Lena Hoffmann', 'Audit Committee', { boards: ['Audit Committee'] }),
  sharedBy('Jonas Weber', 'Works Council', { organization: ['Works Council'] }),
];

function useColumns(organizationId: string | undefined): TableColumns<PersonSummary> {
  const t = useTranslate();

  return [
    {
      key: 'name',
      header: t('members.columns.person'),
      width: 2.5,
      sortable: true,
      render: (row) => <Anchor component={Link} to={memberPath(row)} size="sm">{row.name}</Anchor>,
    },
    {
      key: 'organization',
      header: t('members.columns.organization'),
      width: 2.5,
      sortable: true,
      hideable: true,
      hidden: organizationId !== undefined,
    },
    { key: 'email', header: t('members.columns.email'), width: 3, hideable: true, hidden: true },
    {
      key: 'boards',
      header: t('members.columns.boards'),
      width: 4,
      hideable: true,
      wrap: true,
      render: (row) => row.boards.join(', '),
    },
    {
      key: 'roles',
      header: t('members.columns.roles'),
      width: 2,
      hideable: true,
      // The stored roles ("Chair, Member") in the current language.
      render: (row) => row.roles.map((role) => t(`roles.${role}`)).join(', '),
    },
  ];
}

function useFilters(): TableFilters {
  const boards = useBoardList();
  const members = useMemberService();
  const organizations = useOrganizationService();

  return {
    name: personFilter(members.suggest),
    organization: organizationFilter(organizations.suggest),
    boards: boardFilter(boards),
  };
}

function useActions(organizationId: string | undefined): TableActions<PersonSummary> {
  const t = useTranslate();
  const navigate = useNavigate();
  const createPerson = useCreatePersonFlow(organizationId);
  const editPerson = useEditPersonFlow();
  const deletePeople = useDeletePeopleFlow();

  return [
    newAction(t('members.new'), createPerson),
    openAction((row) => navigate(memberPath(row))),
    editAction(editPerson),
    deleteAction(deletePeople),
  ];
}

// The people (create, edit, delete), with their boards and roles: all of them (the "Members" module), or those of one
// organization (`organizationId`, on its page: a new person belongs to it, and the organization column is hidden). A
// person opens on their own page ("Open", also a double click, or the name). The memberships are changed on the page
// of a board.
function PersonTable(
  { organizationId, title, subtitle }: { organizationId?: string; title: string; subtitle: string },
) {
  const tableCtrl = useDataTableController<PersonSummary>();
  const columns = useColumns(organizationId);
  const filters = useFilters();
  const actions = useActions(organizationId);
  const savedFilters = useSavedFilters('board-manager:saved-filters:members', COLLEAGUES_FILTERS);
  const source = useSource(organizationId, tableCtrl.reload);

  return (
    <DataTable
      controller={tableCtrl}
      title={title}
      subtitle={subtitle}
      density="compact"
      searchable
      reloadable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      savedFilters={organizationId === undefined ? savedFilters : undefined}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
