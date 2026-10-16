import { textFilter, useDataTableController } from '@local/data-table/react';
import type { SavedFilter, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import { fetchOrganizations } from '../../../infra/in-memory/index.js';
import type { OrganizationRow } from '../../../infra/in-memory/index.js';
import { countryName } from '../../../shared/lib/countries.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, PAGE_SIZE_OPTIONS, useDb, useReloadOnChange } from '../../../shared/shared.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { WebsiteLink } from '../components/website-link.js';
import { countryFilter, organizationFilter } from '../organization-filters.js';
import {
  useCreateOrganizationFlow,
  useDeleteOrganizationsFlow,
  useEditOrganizationFlow,
} from '../organization-flows.js';

export { OrganizationsPage };

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Stuttgart', { city: { text: 'Stuttgart', match: 'contains' } }),
  sharedBy('Lena Hoffmann', 'Investors', { name: ['Nordic Capital Partners', 'Gulf Invest', 'Stein Family Office'] }),
];

function useColumns(): TableColumns<OrganizationRow> {
  const t = useTranslate();

  return [
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
  ];
}

function useFilters(): TableFilters {
  const organizations = useDb((state) => state.organizations);

  return {
    name: organizationFilter,
    city: textFilter(),
    countryName: countryFilter(organizations),
  };
}

function useActions(): TableActions<OrganizationRow> {
  const t = useTranslate();
  const navigate = useNavigate();
  const createOrganization = useCreateOrganizationFlow();
  const editOrganization = useEditOrganizationFlow();
  const deleteOrganizations = useDeleteOrganizationsFlow();

  return [
    newAction(t('organizations.new'), createOrganization),
    openAction((row) => navigate(`/organizations/${row.id}`)),
    editAction((row) => editOrganization(row.id)),
    deleteAction(deleteOrganizations),
  ];
}

// The "Organizations" module: every organization, with a new one, editing and deleting (its people stay, without an
// organization). One opens on its own page, with its people.
function OrganizationsPage() {
  const t = useTranslate();
  const tableCtrl = useDataTableController<OrganizationRow>();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions();
  const savedFilters = useSavedFilters('board-manager:saved-filters:organizations', COLLEAGUES_FILTERS);

  useReloadOnChange(tableCtrl);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('modules.organizations')}
      subtitle={t('organizations.listSubtitle')}
      density="compact"
      searchable
      reloadable
      source={fetchOrganizations}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
