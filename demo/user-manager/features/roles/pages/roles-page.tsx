import { singleRowAction, useDataTableController } from '@local/data-table/react';
import type { TableActions, TableColumns } from '@local/data-table/react';
import { Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import { Link, useNavigate } from 'react-router';
import type { AccessData, Role } from '../../../domain/index.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { PageHeader } from '../../../shared/ui/parts.js';
import { deleteAction, newAction, openAction } from '../../../shared/ui/table-actions.js';
import { useTableSource } from '../../iam/index.js';
import { useCreateRoleFlow, useDeleteRolesFlow } from '../role-flows.js';

export { RolesPage };

type RoleRow = Role & { permissions: number; grants: number; kind: string };

function roleRows(data: AccessData): RoleRow[] {
  return data.roles.map((role) => ({
    ...role,
    permissions: role.permissionIds.length,
    grants: data.grants.filter((grant) => grant.roleId === role.id).length,
    kind: role.builtIn ? 'Built-in' : 'Custom',
  }));
}

const columns: TableColumns<RoleRow> = [
  {
    key: 'name',
    header: 'Name',
    width: 2.5,
    sortable: true,
    render: (row) => (
      <Group gap={8} wrap="nowrap">
        <Anchor component={Link} to={`/roles/${row.id}`} size="sm" truncate>{row.name}</Anchor>
        {row.builtIn && <Badge size="xs" variant="outline">Built-in</Badge>}
      </Group>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    width: 4,
    hideable: true,
    render: (row) => <Text size="sm" truncate>{row.description}</Text>,
  },
  { key: 'permissions', header: 'Permissions', width: 1.4, sortable: true, align: 'end' },
  { key: 'grants', header: 'Granted', width: 1.2, sortable: true, align: 'end', hideable: true },
];

function useActions(): TableActions<RoleRow> {
  const navigate = useNavigate();
  const createRole = useCreateRoleFlow();
  const deleteRoles = useDeleteRolesFlow();

  return [
    newAction('New role', () => createRole()),
    openAction((row) => navigate(`/roles/${row.id}`)),
    singleRowAction('duplicate', createRole, { icon: appIcons.copy, tip: 'Duplicate', show: 'both' }),
    deleteAction(deleteRoles),
  ];
}

// All roles: named sets of permissions, granted on scopes.
function RolesPage() {
  const tableCtrl = useDataTableController<RoleRow>();
  const actions = useActions();
  const source = useTableSource<RoleRow>('roles', roleRows, { search: ['name', 'description'] }, tableCtrl.reload);

  return (
    <Stack gap="md">
      <PageHeader
        title="Roles"
        subtitle="Named sets of permissions. Built-in roles cannot be changed; duplicate one to start your own."
      />
      <DataTable
        controller={tableCtrl}
        source={source}
        rowKey="id"
        columns={columns}
        actions={actions}
        searchable
        defaultSort={{ key: 'name', direction: 'asc' }}
      />
    </Stack>
  );
}
