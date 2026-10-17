import { Text } from '@mantine/core';

import type { TableColumns, TableFilters } from '@local/data-table/react';
import { DataTable } from '@local/micro-app';

import type { AccessData } from '../../../domain/index.js';
import { permissionParts } from '../../../domain/index.js';
import { useAccessData, useTableSource } from '../../iam/index.js';
import { appFilter } from '../role-filters.js';

export { PermissionTable };

type PermissionRow = { id: string; app: string; resource: string; action: string; description: string; roles: string };

function permissionRows(data: AccessData): PermissionRow[] {
  return data.permissions.map((permission) => ({
    ...permissionParts(permission.id),
    id: permission.id,
    app: data.scopes.find((scope) => scope.id === `s-${permission.app}`)?.name ?? permission.app,
    description: permission.description,
    roles: data.roles.filter((role) => role.permissionIds.includes(permission.id)).map((role) => role.name).join(', '),
  }));
}

const columns: TableColumns<PermissionRow> = [
  {
    key: 'id',
    header: 'Permission',
    width: 2.5,
    sortable: true,
    render: (row) => <Text size="sm" ff="monospace">{row.id}</Text>,
  },
  {
    key: 'app',
    header: 'App',
    width: 1.6,
    sortable: true,
  },
  { key: 'description', header: 'Allows', width: 3, hideable: true },
  {
    key: 'roles',
    header: 'In roles',
    width: 3,
    hideable: true,
    render: (row) => <Text size="sm" truncate>{row.roles}</Text>,
  },
];

function useFilters(): TableFilters {
  const data = useAccessData();

  return { app: appFilter(data) };
}

function PermissionTable() {
  const filters = useFilters();
  const source = useTableSource<PermissionRow>(
    'permissions',
    permissionRows,
    { search: ['id', 'description', 'roles'] },
  );

  return (
    <DataTable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      searchable
      pageSizeOptions={[25, 50, 100]}
      defaultSort={{ key: 'id', direction: 'asc' }}
    />
  );
}
