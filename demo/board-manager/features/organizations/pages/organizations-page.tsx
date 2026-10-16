import { textFilter, useDataTableController } from '@local/data-table/react';
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
import type {
  OrganizationCriteria,
  OrganizationSortKey,
  OrganizationSummary,
  TextMatch,
} from '../../../domain/index.js';

import { countryName } from '../../../shared/lib/countries.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { searchText, toPaging, toSort, usePageSource } from '../../../shared/lib/table-query.js';
import { DataTable, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { WebsiteLink } from '../components/website-link.js';
import { useOrganizationService } from '../context.js';
import { organizationKeys } from '../keys.js';
import { countryFilter, organizationFilter } from '../organization-filters.js';
import {
  useCreateOrganizationFlow,
  useDeleteOrganizationsFlow,
  useEditOrganizationFlow,
} from '../organization-flows.js';

import { useOrganizationList } from '../reads.js';

export { OrganizationsPage };

const SORT_KEYS: readonly OrganizationSortKey[] = ['name', 'city', 'country', 'people'];

function toCriteria(query: RowQuery): OrganizationCriteria {
  const { name, city, country } = query.filters as { name?: string[]; city?: TextMatch; country?: string[] };

  return { text: searchText(query), names: name, city, countries: country };
}

function useSource(reload: () => void): RowSource<OrganizationSummary> {
  const service = useOrganizationService();

  return usePageSource(
    organizationKeys.all,
    (query, signal) => service.find(toCriteria(query), toSort(query, SORT_KEYS), toPaging(query), signal),
    reload,
  );
}

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Maria Keller', 'Stuttgart', { city: { text: 'Stuttgart', match: 'contains' } }),
  sharedBy('Lena Hoffmann', 'Investors', { name: ['Nordic Capital Partners', 'Gulf Invest', 'Stein Family Office'] }),
];

function useColumns(): TableColumns<OrganizationSummary> {
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
      key: 'country',
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
  const service = useOrganizationService();
  const organizations = useOrganizationList();

  return {
    name: organizationFilter(service.suggest),
    city: textFilter(),
    country: countryFilter(organizations),
  };
}

function useActions(): TableActions<OrganizationSummary> {
  const t = useTranslate();
  const navigate = useNavigate();
  const createOrganization = useCreateOrganizationFlow();
  const editOrganization = useEditOrganizationFlow();
  const deleteOrganizations = useDeleteOrganizationsFlow();

  return [
    newAction(t('organizations.new'), createOrganization),
    openAction((row) => navigate(`/organizations/${row.id}`)),
    editAction(editOrganization),
    deleteAction(deleteOrganizations),
  ];
}

// The "Organizations" module: every organization, with a new one, editing and deleting (its people stay, without an
// organization). One opens on its own page, with its people.
function OrganizationsPage() {
  const t = useTranslate();
  const tableCtrl = useDataTableController<OrganizationSummary>();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions();
  const savedFilters = useSavedFilters('board-manager:saved-filters:organizations', COLLEAGUES_FILTERS);
  const source = useSource(tableCtrl.reload);

  return (
    <DataTable
      controller={tableCtrl}
      title={t('modules.organizations')}
      subtitle={t('organizations.listSubtitle')}
      density="compact"
      searchable
      reloadable
      source={source}
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
