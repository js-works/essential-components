import {
  defineActions,
  defineColumns,
  defineFilters,
  textFilter,
  useDataTableController,
} from '@local/data-table/react';
import type { SavedFilter } from '@local/data-table/react';
import { useDialogs, useToast } from '@local/overlays/react';
import { Anchor } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import type { Organization } from '../../../domain/index.js';
import { fetchOrganizations } from '../../../infra/in-memory/index.js';
import type { OrganizationRow } from '../../../infra/in-memory/index.js';
import { countryName } from '../../../shared/lib/countries.js';
import type { TableContext } from '../../../shared/lib/flows.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import type { Translate } from '../../../shared/lib/i18n/index.js';
import { DataTable, PAGE_SIZE_OPTIONS, useDb } from '../../../shared/shared.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { createOrganizationFlow, deleteOrganizationsFlow, editOrganization } from '../components/organizationFlows.js';
import { WebsiteLink } from '../components/WebsiteLink.js';
import { countryFilter, organizationFilter } from '../filters.js';

export { OrganizationsPage };

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Stuttgart', { city: { text: 'Stuttgart', match: 'contains' } }),
  sharedBy('Lena Hoffmann', 'Investors', { name: ['Nordic Capital Partners', 'Gulf Invest', 'Stein Family Office'] }),
];

// The columns of the organizations list, with their headers in the current language.
const columnsOf = (t: Translate) =>
  defineColumns<OrganizationRow>([
    {
      key: 'name',
      header: t('organizations.columns.organization'),
      width: 3,
      sortable: true,
      render: (row) => <Anchor component={Link} to={`/organizations/${row.id}`} size="sm">{row.name}</Anchor>,
    },
    {
      key: 'description',
      header: t('organizations.columns.description'),
      width: 4,
      hideable: true,
      hidden: true,
      wrap: true,
    },
    {
      key: 'city',
      header: t('organizations.columns.city'),
      width: 2,
      sortable: true,
      hideable: true,
    },
    {
      key: 'countryName',
      header: t('organizations.columns.country'),
      render: (row) => countryName(row.country),
      width: 2,
      sortable: true,
      hideable: true,
    },
    {
      key: 'website',
      header: t('organizations.columns.website'),
      width: 3,
      hideable: true,
      render: (row) => <WebsiteLink url={row.website} />,
    },
    {
      key: 'people',
      header: t('organizations.columns.members'),
      width: 1,
      sortable: true,
      hideable: true,
      align: 'end',
    },
  ]);

// The filters of the organizations list (the countries: those the organizations have).
const filtersOf = (organizations: readonly Organization[]) =>
  defineFilters({
    name: organizationFilter,
    city: textFilter(),
    countryName: countryFilter(organizations),
  });

// What the actions of the organizations list need: the table's context, and where an organization opens.
type OrganizationListContext = TableContext<OrganizationRow> & { navigate: NavigateFunction };

// The actions of the organizations list: new, open (the default action), edit, delete (its people stay, without an
// organization).
const actionsOf = (t: Translate, ctx: OrganizationListContext) =>
  defineActions<OrganizationRow>([
    newAction(t('organizations.new'), () => createOrganizationFlow(ctx)),
    openAction((row) => ctx.navigate(`/organizations/${row.id}`)),
    editAction(async (row) => (await editOrganization(ctx.dialogs, ctx.toasts, row.id)) && ctx.nav.reload()),
    deleteAction(async (rows) => (await deleteOrganizationsFlow(ctx.dialogs, ctx.toasts, rows)) && ctx.nav.reload()),
  ]);

// The "Organizations" module: every organization, with a new one, editing and deleting (its people stay, without an
// organization). One opens on its own page, with its people.
function OrganizationsPage(): ReactElement {
  const t = useTranslate();
  const nav = useDataTableController<OrganizationRow>();
  const ctx = { dialogs: useDialogs(), toasts: useToast(), nav, navigate: useNavigate() };
  const organizations = useDb((state) => state.organizations);
  const savedFilters = useSavedFilters('board-manager:saved-filters:organizations', COLLEAGUES_FILTERS);

  return (
    <DataTable
      controller={nav}
      title={t('modules.organizations')}
      subtitle={t('organizations.listSubtitle')}
      density="compact"
      searchable
      reloadable
      source={fetchOrganizations}
      rowKey="id"
      columns={columnsOf(t)}
      filters={filtersOf(organizations)}
      actions={actionsOf(t, ctx)}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
