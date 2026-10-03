import { Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { selectColumnFilter, useDataNavigatorController } from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import { groupsOf } from '../../../domain';
import type { AccessData, User } from '../../../domain';
import { formatDateTime } from '../../../shared/lib/format';
import { oneOf } from '../../../shared/lib/localQuery';
import { appIcons } from '../../../shared/ui/icons';
import { Navigator } from '../../../shared/ui/navigator';
import { PageHeader, UserAvatar } from '../../../shared/ui/parts';
import { useGrantAccess } from '../../access';
import { useTableSource } from '../../iam';
import { DEPARTMENTS } from '../components/UserForm';
import { useUserFlows } from '../flows';

export { UsersPage };

type UserRow = User & { status: 'Active' | 'Disabled'; groups: string; groupCount: number; grants: number };

function userRows(data: AccessData): UserRow[] {
  return data.users.map((user) => {
    const groups = groupsOf(data.groups, user.id);

    return {
      ...user,
      status: user.active ? 'Active' : 'Disabled',
      groups: groups.map((group) => group.name).join(', '),
      groupCount: groups.length,
      grants: data.grants.filter((grant) => grant.principal.type === 'user' && grant.principal.id === user.id).length,
    };
  });
}

// All users: their department, groups and status. Open one for its details and access.
function UsersPage(): ReactElement {
  const nav = useDataNavigatorController<UserRow>();
  const navigate = useNavigate();
  const flows = useUserFlows();
  const grantAccess = useGrantAccess();
  const source = useTableSource<UserRow>('users', userRows, {
    search: ['name', 'email', 'title', 'department', 'groups'],
    filters: {
      department: (row, value) => oneOf(row.department, value),
      status: (row, value) => oneOf(row.status, value),
    },
  }, nav.reload);

  const columns = useMemo((): readonly DataNavigatorComponent.Column<UserRow>[] => [
    {
      key: 'name',
      header: 'Name',
      width: 3,
      sortable: true,
      render: (row) => (
        <Group gap={8} wrap="nowrap">
          <UserAvatar name={row.name} />
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Anchor component={Link} to={`/users/${row.id}`} size="sm" truncate>{row.name}</Anchor>
            <Text size="xs" c="dimmed" truncate>{row.title}</Text>
          </Stack>
        </Group>
      ),
    },
    { key: 'email', header: 'Email', width: 3, sortable: true, hideable: true },
    {
      key: 'department',
      header: 'Department',
      width: 2,
      sortable: true,
      hideable: true,
      filter: selectColumnFilter({ options: DEPARTMENTS.map((value) => ({ value, label: value })), multiple: true }),
    },
    {
      key: 'groups',
      header: 'Groups',
      width: 3,
      hideable: true,
      render: (row) => <Text size="sm" truncate>{row.groups}</Text>,
    },
    {
      key: 'status',
      header: 'Status',
      width: 1.4,
      sortable: true,
      render: (row) => <Badge variant="light" color={row.active ? 'success' : 'gray'}>{row.status}</Badge>,
      filter: selectColumnFilter({
        options: [{ value: 'Active', label: 'Active' }, { value: 'Disabled', label: 'Disabled' }],
        multiple: true,
      }),
    },
    {
      key: 'created',
      header: 'Created',
      width: 2,
      sortable: true,
      hideable: true,
      hidden: true,
      render: (row) => formatDateTime(row.created),
    },
  ], []);

  const actions = useMemo((): readonly DataNavigatorComponent.Action<UserRow>[] => [
    { type: 'general', key: 'new', label: 'New user', icon: appIcons.addUser, onClick: () => void flows.create() },
    {
      type: 'singleRow',
      key: 'open',
      icon: appIcons.open,
      tip: 'Open',
      show: 'column',
      default: true,
      onClick: (row) => void navigate(`/users/${row.id}`),
    },
    {
      type: 'singleRow',
      key: 'edit',
      icon: appIcons.edit,
      tip: 'Edit',
      show: 'both',
      onClick: (row) => void flows.edit(row),
    },
    {
      type: 'singleRow',
      key: 'grant',
      label: 'Grant access',
      icon: appIcons.access,
      show: 'toolbar',
      onClick: (row) => void grantAccess({ principal: { type: 'user', id: row.id } }),
    },
    {
      type: 'multiRow',
      key: 'enable',
      label: 'Enable',
      icon: appIcons.enable,
      onClick: (rows) => void flows.setActive(rows, true),
    },
    {
      type: 'multiRow',
      key: 'disable',
      label: 'Disable',
      icon: appIcons.disable,
      onClick: (rows) => void flows.setActive(rows, false),
    },
    {
      type: 'multiRow',
      key: 'delete',
      label: 'Delete',
      icon: appIcons.remove,
      variant: 'danger',
      onClick: (rows) => void flows.remove(rows),
    },
  ], [flows, navigate, grantAccess]);

  return (
    <Stack gap="md">
      <PageHeader
        title="Users"
        subtitle="Everyone who signs in. A disabled user keeps their data and grants, but has no access."
      />
      <Navigator
        controller={nav}
        source={source}
        rowKey="id"
        columns={columns}
        actions={actions}
        searchable
        reloadable
        pageSize={25}
        pageSizeOptions={[25, 50, 100]}
        defaultSort={{ key: 'name', direction: 'asc' }}
      />
    </Stack>
  );
}
