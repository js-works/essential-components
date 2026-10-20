import { createFileRoute, useNavigate } from '@tanstack/react-router';

import type { TableActions, TableColumns } from '@local/data-table/react';
import { criteriaOf, textFilter } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { OrganizationCriteria, OrganizationSummary } from '../../domain/index.js';
import { ORGANIZATION_SORT_KEYS } from '../../domain/index.js';
import { WebsiteLink } from '../../features/organizations/organization-components.js';
import { useOrganizationList, useOrganizationService } from '../../features/organizations/organization-data.js';
import { countryFilter, organizationFilter } from '../../features/organizations/organization-filters.js';
import { useOrganizationFlows } from '../../features/organizations/organization-flows.js';
import { countryName } from '../../shared/lib/countries.js';
import { useTranslate } from '../../shared/lib/i18n/index.js';
import { PAGE_SIZE_OPTIONS } from '../../shared/shared.js';

export const Route = createFileRoute('/organizations/')({ component: OrganizationTable });

function useColumns(): TableColumns<OrganizationSummary> {
  const t = useTranslate();

  return [
    {
      key: 'name',
      header: t('organizations.columns.organization'),
      width: 3,
      sortable: true,
      render: (row) => (
        <AnchorLink to="/organizations/$organizationId" params={{ organizationId: row.id }} size="sm">
          {row.name}
        </AnchorLink>
      ),
    },
    {
      key: 'description',
      header: t('organizations.columns.description'),
      width: 4,
      hideable: true,
      hidden: true,
      wrap: true,
    },
    { key: 'city', header: t('organizations.columns.city'), width: 2, sortable: true, hideable: true },
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

function useActions(): TableActions<OrganizationSummary> {
  const { deleteAction, editAction, newAction, openAction } = useTableActions();
  const t = useTranslate();
  const navigate = useNavigate();
  const flows = useOrganizationFlows();

  return [
    newAction(t('organizations.new'), flows.create),
    openAction((row) => navigate({ to: '/organizations/$organizationId', params: { organizationId: row.id } })),
    editAction(flows.edit),
    deleteAction(flows.remove),
  ];
}

// The "Organizations" module.
function OrganizationTable() {
  const t = useTranslate();
  const service = useOrganizationService();
  const organizations = useOrganizationList();
  const source = useFindSource(
    ['organizations'],
    ORGANIZATION_SORT_KEYS,
    criteriaOf<OrganizationCriteria>('text'),
    service.find,
  );
  const columns = useColumns();
  const actions = useActions();
  const savedFilters = useSavedTableFilters('organizations');

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
      filters={{
        names: { label: t('organizations.columns.organization'), filter: organizationFilter(service.suggest) },
        city: textFilter(),
        countries: { label: t('organizations.columns.country'), filter: countryFilter(organizations) },
      }}
      actions={actions}
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
