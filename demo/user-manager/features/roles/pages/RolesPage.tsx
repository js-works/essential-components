import { Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDataNavigatorController } from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import type { AccessData, Role } from '../../../domain';
import { appIcons } from '../../../shared/ui/icons';
import { Navigator } from '../../../shared/ui/navigator';
import { PageHeader } from '../../../shared/ui/parts';
import { useTableSource } from '../../iam';
import { useRoleFlows } from '../flows';

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

// All roles: named sets of permissions, granted on scopes.
function RolesPage(): ReactElement {
  const nav = useDataNavigatorController<RoleRow>();
  const navigate = useNavigate();
  const flows = useRoleFlows();
  const source = useTableSource<RoleRow>('roles', roleRows, { search: ['name', 'description'] }, nav.reload);

  const columns = useMemo((): readonly DataNavigatorComponent.Column<RoleRow>[] => [
    {
      key: 'name',
      header: 'Name',
      width: 2.5,
      sortable: true,
      render: (row) => (
        <Group gap={8} wrap="nowrap">
          <Anchor component={Link} to={`/roles/${row.id}`} size="sm" truncate>{row.name}</Anchor>
          {row.builtIn && <Badge size="xs" variant="light" color="gray">Built-in</Badge>}
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
  ], []);

  const actions = useMemo((): readonly DataNavigatorComponent.Action<RoleRow>[] => [
    { type: 'general', key: 'new', label: 'New role', icon: appIcons.add, onClick: () => void flows.create() },
    {
      type: 'singleRow',
      key: 'open',
      icon: appIcons.open,
      tip: 'Open',
      show: 'column',
      default: true,
      onClick: (row) => void navigate(`/roles/${row.id}`),
    },
    {
      type: 'singleRow',
      key: 'duplicate',
      icon: appIcons.copy,
      tip: 'Duplicate',
      show: 'both',
      onClick: (row) => void flows.create(row),
    },
    {
      type: 'multiRow',
      key: 'delete',
      label: 'Delete',
      icon: appIcons.remove,
      variant: 'danger',
      onClick: (rows) => void flows.remove(rows),
    },
  ], [flows, navigate]);

  return (
    <Stack gap="md">
      <PageHeader
        title="Roles"
        subtitle="Named sets of permissions. Built-in roles cannot be changed; duplicate one to start your own."
      />
      <Navigator
        controller={nav}
        source={source}
        rowKey="id"
        columns={columns}
        actions={actions}
        searchable
        pageSize={25}
        defaultSort={{ key: 'name', direction: 'asc' }}
      />
    </Stack>
  );
}
