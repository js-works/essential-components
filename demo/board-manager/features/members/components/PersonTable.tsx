import { defineActions, defineColumns, defineFilters, useDataTableController } from '@local/data-table/react';
import type { SavedFilter } from '@local/data-table/react';
import { useDialogs, useToast } from '@local/overlays/react';
import { Anchor } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import type { Board, Role } from '../../../domain/index.js';
import { fetchPeople } from '../../../infra/in-memory/index.js';
import type { PersonRow } from '../../../infra/in-memory/index.js';
import type { TableContext } from '../../../shared/lib/flows.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable, PAGE_SIZE_OPTIONS, useDb } from '../../../shared/shared.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { boardFilter } from '../../boards/filters.js';
import { organizationFilter } from '../../organizations/filters.js';
import { personFilter } from '../filters.js';
import { createPersonFlow, deletePeopleFlow, editPerson } from './personFlows.js';

export { memberPath, PersonTable };

// A member's page.
const memberPath = (person: { id: string }) => `/members/${person.id}`;

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Lena Hoffmann', 'Audit Committee', { boards: ['Audit Committee'] }),
  sharedBy('Jonas Weber', 'Works Council', { organization: ['Works Council'] }),
];

// The columns of a people list, with their headers in the current language (the organization column hidden on an
// organization's page).
const columnsOf = (t: Translate, organizationId: string | undefined) =>
  defineColumns<PersonRow>([
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
  ]);

// The filters of a people list.
const filtersOf = (boards: readonly Board[]) =>
  defineFilters({
    name: personFilter,
    organization: organizationFilter,
    boards: boardFilter(boards),
  });

// What the actions of a people list need: the table's context, where a person opens, and the organization of the list.
type PersonListContext = TableContext<PersonRow> & { navigate: NavigateFunction; organizationId?: string };

// The actions of a people list: new, open (the default action), edit, delete.
const actionsOf = (t: Translate, ctx: PersonListContext) =>
  defineActions<PersonRow>([
    newAction(t('members.new'), () => createPersonFlow(ctx, ctx.organizationId)),
    openAction((row) => ctx.navigate(memberPath(row))),
    editAction(async (row) => (await editPerson(ctx.dialogs, ctx.toasts, row.id)) && ctx.nav.reload()),
    deleteAction(async (rows) => (await deletePeopleFlow(ctx.dialogs, ctx.toasts, rows)) && ctx.nav.reload()),
  ]);

// The people (create, edit, delete), with their boards and roles: all of them (the "Members" module), or those of one
// organization (`organizationId`, on its page: a new person belongs to it, and the organization column is hidden). A
// person opens on their own page ("Open", also a double click, or the name). The memberships are changed on the page
// of a board.
function PersonTable(
  { organizationId, title, subtitle }: { organizationId?: string; title: string; subtitle: string },
): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<PersonRow>();
  const ctx = { dialogs: useDialogs(), toasts: useToast(), nav, navigate: useNavigate(), organizationId };
  const boards = useDb((state) => state.boards);
  const savedFilters = useSavedFilters('board-manager:saved-filters:members', COLLEAGUES_FILTERS);

  return (
    <DataTable
      controller={nav}
      title={title}
      subtitle={subtitle}
      density="compact"
      searchable
      reloadable
      source={fetchPeople(organizationId)}
      rowKey="id"
      columns={columnsOf(t, organizationId)}
      filters={filtersOf(boards)}
      actions={actionsOf(t, ctx)}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      savedFilters={organizationId === undefined ? savedFilters : undefined}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
