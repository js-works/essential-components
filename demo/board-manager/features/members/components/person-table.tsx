import { useDataTableController } from '@local/data-table/react';
import type { SavedFilter, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import type { Role } from '../../../domain/index.js';
import { fetchPeople } from '../../../infra/in-memory/index.js';
import type { PersonRow } from '../../../infra/in-memory/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, PAGE_SIZE_OPTIONS, useDb, useReloadOnChange } from '../../../shared/shared.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { boardFilter } from '../../boards/filters/board-filters.js';
import { organizationFilter } from '../../organizations/organization-filters.js';
import { personFilter } from '../member-filters.js';
import { useCreatePersonFlow, useDeletePeopleFlow, useEditPersonFlow } from '../member-flows.js';

export { memberPath, PersonTable };

// A member's page.
const memberPath = (person: { id: string }) => `/members/${person.id}`;

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Lena Hoffmann', 'Audit Committee', { boards: ['Audit Committee'] }),
  sharedBy('Jonas Weber', 'Works Council', { organization: ['Works Council'] }),
];

function useColumns(organizationId: string | undefined): TableColumns<PersonRow> {
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
    },
    {
      key: 'roles',
      header: t('members.columns.roles'),
      width: 2,
      hideable: true,
      // The stored roles ("Chair, Member") in the current language.
      render: (row) =>
        row.roles === '' ? '' : row.roles.split(', ').map((role) => t(`roles.${role as Role}`)).join(', '),
    },
  ];
}

function useFilters(): TableFilters {
  const boards = useDb((state) => state.boards);

  return {
    name: personFilter,
    organization: organizationFilter,
    boards: boardFilter(boards),
  };
}

function useActions(organizationId: string | undefined): TableActions<PersonRow> {
  const t = useTranslate();
  const navigate = useNavigate();
  const createPerson = useCreatePersonFlow(organizationId);
  const editPerson = useEditPersonFlow();
  const deletePeople = useDeletePeopleFlow();

  return [
    newAction(t('members.new'), createPerson),
    openAction((row) => navigate(memberPath(row))),
    editAction((row) => editPerson(row.id)),
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
  const tableCtrl = useDataTableController<PersonRow>();
  const columns = useColumns(organizationId);
  const filters = useFilters();
  const actions = useActions(organizationId);
  const savedFilters = useSavedFilters('board-manager:saved-filters:members', COLLEAGUES_FILTERS);

  useReloadOnChange(tableCtrl);

  return (
    <DataTable
      controller={tableCtrl}
      title={title}
      subtitle={subtitle}
      density="compact"
      searchable
      reloadable
      source={fetchPeople(organizationId)}
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
