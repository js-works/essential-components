import { Badge } from '@mantine/core';

import type { TableActions, TableColumn, TableColumns, TableFilters } from '@local/data-table/react';
import { dateRangeFilter, multiRowAction, singleRowAction } from '@local/data-table/react';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { AccessData, Grant } from '../../../domain/index.js';
import { scopeLabel } from '../../../domain/index.js';
import { formatDateTime } from '../../../shared/lib/format.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { PrincipalLabel, principalName } from '../../../shared/ui/parts.js';
import { useAccessData, useTableSource } from '../../iam/index.js';
import { roleFilter } from '../../roles/index.js';
import { principalTypeFilter } from '../access-filters.js';
import type { GrantPreset } from '../access-flows.js';
import { useGrantAccessFlow, useRevokeGrantsFlow } from '../access-flows.js';

export { GrantTable };

// The columns a grants table may leave out, when its page makes them clear (e.g. "who" on a user's page).
type HiddenColumn = 'who' | 'role';

type GrantRow = {
  id: string;
  who: string;
  type: 'User' | 'Group';
  role: string;
  scope: string;
  created: string;
  grantedBy: string;
  grant: Grant;
};

function grantRows(data: AccessData, filter: (grant: Grant) => boolean): GrantRow[] {
  return data.grants.filter(filter).map((grant) => ({
    id: grant.id,
    who: principalName(data, grant.principal),
    type: grant.principal.type === 'user' ? 'User' : 'Group',
    role: data.roles.find((role) => role.id === grant.roleId)?.name ?? '',
    scope: scopeLabel(data.scopes, grant.scopeId),
    created: grant.created,
    grantedBy: grant.grantedBy,
    grant,
  }));
}

function useColumns(hide: readonly HiddenColumn[]): TableColumns<GrantRow> {
  const data = useAccessData();

  return [
    ...(hide.includes('who') ? [] : [
      {
        key: 'who',
        header: 'Who',
        width: 3,
        sortable: true,
        render: (row) => data === undefined ? row.who : <PrincipalLabel data={data} principal={row.grant.principal} />,
      } satisfies TableColumn<GrantRow>,
      {
        key: 'type',
        header: 'Type',
        width: 1.2,
        hideable: true,
        render: (row) => <Badge variant={row.type === 'User' ? 'outline' : 'light'}>{row.type}</Badge>,
      } satisfies TableColumn<GrantRow>,
    ]),
    ...(hide.includes('role') ? [] : [
      {
        key: 'role',
        header: 'Role',
        width: 2.2,
        sortable: true,
        render: (row) => (
          <AnchorLink to="/roles/$roleId" params={{ roleId: row.grant.roleId }} size="sm">{row.role}</AnchorLink>
        ),
      } satisfies TableColumn<GrantRow>,
    ]),
    { key: 'scope', header: 'Where', width: 3.5, sortable: true },
    {
      key: 'created',
      header: 'Granted',
      width: 2,
      sortable: true,
      hideable: true,
      render: (row) => formatDateTime(row.created),
    },
    { key: 'grantedBy', header: 'By', width: 1.2, hideable: true, hidden: true },
  ];
}

function useFilters(hide: readonly HiddenColumn[]): TableFilters {
  const data = useAccessData();

  return {
    ...(hide.includes('who') ? {} : { type: principalTypeFilter }),
    ...(hide.includes('role') ? {} : { role: roleFilter(data?.roles ?? []) }),
    created: dateRangeFilter(),
  };
}

function useActions(preset: GrantPreset | undefined): TableActions<GrantRow> {
  const { newAction } = useTableActions();
  const grantAccess = useGrantAccessFlow();
  const revokeGrants = useRevokeGrantsFlow();

  return [
    newAction('Grant access', () => grantAccess(preset), { key: 'grant' }),
    singleRowAction('revoke-row', (row) => revokeGrants([row]), {
      icon: appIcons.remove,
      tip: 'Revoke',
      show: 'column',
      contextMenu: false,
    }),
    multiRowAction('revoke', revokeGrants, { label: 'Revoke', icon: appIcons.remove, variant: 'danger' }),
  ];
}

function GrantTable({ name, filter = () => true, preset, hide = [], title, subtitle }: {
  name: string;
  filter?: (grant: Grant) => boolean;
  preset?: GrantPreset;
  hide?: readonly HiddenColumn[];
  title?: string;
  subtitle?: string;
}) {
  const columns = useColumns(hide);
  const filters = useFilters(hide);
  const actions = useActions(preset);
  const savedFilters = useSavedTableFilters('access');
  const source = useTableSource<GrantRow>(
    name,
    (all) => grantRows(all, filter),
    {
      search: ['who', 'role', 'scope', 'grantedBy'],
    },
  );

  return (
    <DataTable
      {...(title === undefined ? {} : { title })}
      {...(subtitle === undefined ? {} : { subtitle })}
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable
      pageSizeOptions={[10, 25, 50]}
      savedFilters={name === 'all' ? savedFilters : undefined}
      defaultSort={{ key: hide.includes('who') ? 'scope' : 'who', direction: 'asc' }}
      empty="No access granted."
    />
  );
}
