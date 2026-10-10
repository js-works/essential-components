import { Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { selectColumnFilter, useDataTableController } from '../../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../../packages/data-table/src/react';
import { permissionParts } from '../../../domain';
import type { AccessData } from '../../../domain';
import { oneOf } from '../../../shared/lib/localQuery';
import { DataTable } from '../../../shared/ui/dataTable';
import { PageHeader } from '../../../shared/ui/parts';
import { useAccessData, useTableSource } from '../../iam';

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

// The catalog: every permission the apps register, and the roles that give it. Read only.
function PermissionsPage(): ReactElement {
  const nav = useDataTableController<PermissionRow>();
  const data = useAccessData();
  const source = useTableSource<PermissionRow>(
    'permissions',
    permissionRows,
    { search: ['id', 'description', 'roles'], filters: { app: (row, value) => oneOf(row.app, value) } },
    nav.reload,
  );
  const apps = [...new Set((data?.permissions ?? []).map((permission) => permission.app))].map((app) =>
    data?.scopes.find((scope) => scope.id === `s-${app}`)?.name ?? app
  );

  const columns = useMemo((): readonly DataTableComponent.Column<PermissionRow>[] => [
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
      filter: selectColumnFilter({ options: apps.map((app) => ({ value: app, label: app })), multiple: true }),
    },
    { key: 'description', header: 'Allows', width: 3, hideable: true },
    {
      key: 'roles',
      header: 'In roles',
      width: 3,
      hideable: true,
      render: (row) => <Text size="sm" truncate>{row.roles}</Text>,
    },
  ], [apps.join()]);

  return (
    <Stack gap="md">
      <PageHeader
        title="Permissions"
        subtitle="Everything that can be granted: the apps register their permissions, roles bundle them."
      />
      <DataTable
        controller={nav}
        source={source}
        rowKey="id"
        columns={columns}
        searchable
        pageSizeOptions={[25, 50, 100]}
        defaultSort={{ key: 'id', direction: 'asc' }}
      />
    </Stack>
  );
}
