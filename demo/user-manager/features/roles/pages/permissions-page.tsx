import { useDataTableController } from '@local/data-table/react';
import type { TableColumns, TableFilters } from '@local/data-table/react';
import { Stack, Text } from '@mantine/core';
import { permissionParts } from '../../../domain/index.js';
import type { AccessData } from '../../../domain/index.js';
import { oneOf } from '../../../shared/lib/local-query.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { PageHeader } from '../../../shared/ui/parts.js';
import { useAccessData, useTableSource } from '../../iam/index.js';
import { appFilter } from '../role-filters.js';

export { PermissionsPage };

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

// The catalog: every permission the apps register, and the roles that give it. Read only.
function PermissionsPage() {
  const tableCtrl = useDataTableController<PermissionRow>();
  const filters = useFilters();
  const source = useTableSource<PermissionRow>(
    'permissions',
    permissionRows,
    { search: ['id', 'description', 'roles'], filters: { app: (row, value) => oneOf(row.app, value) } },
    tableCtrl.reload,
  );

  return (
    <Stack gap="md">
      <PageHeader
        title="Permissions"
        subtitle="Everything that can be granted: the apps register their permissions, roles bundle them."
      />
      <DataTable
        controller={tableCtrl}
        source={source}
        rowKey="id"
        columns={columns}
        filters={filters}
        searchable
        pageSizeOptions={[25, 50, 100]}
        defaultSort={{ key: 'id', direction: 'asc' }}
      />
    </Stack>
  );
}
