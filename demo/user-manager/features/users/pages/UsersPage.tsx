import {
  defineActions,
  defineColumns,
  defineFilters,
  multiRowAction,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import type { SavedFilter } from '@local/data-table/react';
import { Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import { groupsOf } from '../../../domain/index.js';
import type { AccessData, User } from '../../../domain/index.js';
import { formatDateTime } from '../../../shared/lib/format.js';
import { oneOf } from '../../../shared/lib/localQuery.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { PageHeader, UserAvatar } from '../../../shared/ui/parts.js';
import { sharedBy, useSavedFilters } from '../../../shared/ui/savedFilters.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { useGrantFlows } from '../../access/index.js';
import type { GrantFlows } from '../../access/index.js';
import { useTableSource } from '../../iam/index.js';
import { departmentFilter, userStatusFilter } from '../filters.js';
import { useUserFlows } from '../flows.js';
import type { UserFlows } from '../flows.js';

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

// The colleagues' shared filters of this table (2026-10-11, the user's wish: to show sharing).
const COLLEAGUES_FILTERS: readonly SavedFilter[] = [
  sharedBy('Laura Schmidt', 'Disabled users', { status: ['Disabled'] }),
  sharedBy('Max Müller', 'IT and Finance', { department: ['IT', 'Finance'] }),
];

// The columns of the users list.
const columns = defineColumns<UserRow>([
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
    render: (row) => <Badge variant="light" color={row.active ? undefined : 'gray'}>{row.status}</Badge>,
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
]);

// The filters of the users list.
const filters = defineFilters({ department: departmentFilter, status: userStatusFilter });

// What the actions of the users list need: the flows of users and grants, and where a user opens.
type UserListContext = { flows: UserFlows; grants: GrantFlows; navigate: NavigateFunction };

// The actions of the users list: new, open (the default action), edit, grant access, enable, disable, delete.
const actionsOf = ({ flows, grants, navigate }: UserListContext) =>
  defineActions<UserRow>([
    newAction('New user', () => flows.create()),
    openAction((row) => navigate(`/users/${row.id}`)),
    editAction((row) => flows.edit(row)),
    singleRowAction('grant', (row) => grants.grant({ principal: { type: 'user', id: row.id } }), {
      label: 'Grant access',
      icon: appIcons.access,
      show: 'toolbar',
    }),
    multiRowAction('enable', (rows) => flows.setActive(rows, true), { label: 'Enable', icon: appIcons.enable }),
    multiRowAction('disable', (rows) => flows.setActive(rows, false), { label: 'Disable', icon: appIcons.disable }),
    deleteAction((rows) => flows.remove(rows)),
  ]);

// All users: their department, groups and status. Open one for its details and access.
function UsersPage(): ReactElement {
  const nav = useDataTableController<UserRow>();
  const ctx = { flows: useUserFlows(), grants: useGrantFlows(), navigate: useNavigate() };
  const savedFilters = useSavedFilters('user-manager:saved-filters:users', COLLEAGUES_FILTERS);
  const source = useTableSource<UserRow>('users', userRows, {
    search: ['name', 'email', 'title', 'department', 'groups'],
    filters: {
      department: (row, value) => oneOf(row.department, value),
      status: (row, value) => oneOf(row.status, value),
    },
  }, nav.reload);

  return (
    <Stack gap="md">
      <PageHeader
        title="Users"
        subtitle="Everyone who signs in. A disabled user keeps their data and grants, but has no access."
      />
      <DataTable
        controller={nav}
        source={source}
        rowKey="id"
        columns={columns}
        filters={filters}
        actions={actionsOf(ctx)}
        searchable
        reloadable
        pageSizeOptions={[25, 50, 100]}
        savedFilters={savedFilters}
        defaultSort={{ key: 'name', direction: 'asc' }}
      />
    </Stack>
  );
}
