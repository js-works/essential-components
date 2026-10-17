import { Anchor } from '@mantine/core';
import { Link, useNavigate } from 'react-router';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';

import type { OrganizationCriteria, OrganizationSummary } from '../../../domain/index.js';
import { ORGANIZATION_SORT_KEYS } from '../../../domain/index.js';
import { countryName } from '../../../shared/lib/countries.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { DataTable, PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { useSavedFilters } from '../../../shared/ui/saved-filters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { useOrganizationService } from '../context.js';
import { organizationKeys } from '../keys.js';
import { countryFilter, organizationFilter } from '../organization-filters.js';
import {
  useCreateOrganizationFlow,
  useDeleteOrganizationsFlow,
  useEditOrganizationFlow,
} from '../organization-flows.js';
import { useOrganizationList } from '../reads.js';
import { WebsiteLink } from './website-link.js';

export { OrganizationTable };

function useSource(): RowSource<OrganizationSummary> {
  const service = useOrganizationService();

  return useFindSource(
    organizationKeys.all,
    ORGANIZATION_SORT_KEYS,
    criteriaOf<OrganizationCriteria>('text'),
    service.find,
  );
}

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
  const t = useTranslate();
  const service = useOrganizationService();
  const organizations = useOrganizationList();

  return {
    names: { label: t('organizations.columns.organization'), filter: organizationFilter(service.suggest) },
    city: textFilter(),
    countries: { label: t('organizations.columns.country'), filter: countryFilter(organizations) },
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
function OrganizationTable() {
  const t = useTranslate();
  const source = useSource();
  const columns = useColumns();
  const filters = useFilters();
  const actions = useActions();
  const savedFilters = useSavedFilters('organizations');

  return (
    <DataTable
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
