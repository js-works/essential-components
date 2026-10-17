import { useNavigate } from '@tanstack/react-router';

import type { RowSource, TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { criteriaOf } from '@local/data-table/react';
import { useFindSource } from '@local/data-table/react-query';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { PersonCriteria, PersonSummary } from '../../../domain/index.js';
import { PERSON_SORT_KEYS } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { PAGE_SIZE_OPTIONS } from '../../../shared/shared.js';
import { boardFilter } from '../../boards/filters/board-filters.js';
import { useBoardList } from '../../boards/reads.js';
import { useOrganizationService } from '../../organizations/context.js';
import { organizationFilter } from '../../organizations/organization-filters.js';
import { useMemberService } from '../context.js';
import { memberKeys } from '../keys.js';
import { personFilter } from '../member-filters.js';
import { useCreatePersonFlow, useDeletePeopleFlow, useEditPersonFlow } from '../member-flows.js';

export { memberLink, PersonTable };

const memberLink = (person: { id: string }) => ({ to: '/members/$personId', params: { personId: person.id } }) as const;

function useSource(organizationId: string | undefined): RowSource<PersonSummary> {
  const service = useMemberService();
  const toCriteria = criteriaOf<PersonCriteria>('text');

  return useFindSource(
    [...memberKeys.all, 'people', organizationId ?? ''],
    PERSON_SORT_KEYS,
    (query) => ({ ...toCriteria(query), organizationId }),
    service.find,
  );
}

function useColumns(organizationId: string | undefined): TableColumns<PersonSummary> {
  const t = useTranslate();

  return [
    {
      key: 'name',
      header: t('members.columns.person'),
      width: 2.5,
      sortable: true,
      render: (row) => <AnchorLink {...memberLink(row)} size="sm">{row.name}</AnchorLink>,
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
  const t = useTranslate();
  const boards = useBoardList();
  const members = useMemberService();
  const organizations = useOrganizationService();

  return {
    names: { label: t('members.columns.person'), filter: personFilter(members.suggest) },
    organizations: { label: t('members.columns.organization'), filter: organizationFilter(organizations.suggest) },
    boards: boardFilter(boards),
  };
}

function useActions(organizationId: string | undefined): TableActions<PersonSummary> {
  const { deleteAction, editAction, newAction, openAction } = useTableActions();
  const t = useTranslate();
  const navigate = useNavigate();
  const createPerson = useCreatePersonFlow(organizationId);
  const editPerson = useEditPersonFlow();
  const deletePeople = useDeletePeopleFlow();

  return [
    newAction(t('members.new'), createPerson),
    openAction((row) => navigate(memberLink(row))),
    editAction(editPerson),
    deleteAction(deletePeople),
  ];
}

function PersonTable(
  { organizationId, title, subtitle }: { organizationId?: string; title: string; subtitle: string },
) {
  const source = useSource(organizationId);
  const columns = useColumns(organizationId);
  const filters = useFilters();
  const actions = useActions(organizationId);
  const savedFilters = useSavedTableFilters('members');

  return (
    <DataTable
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
