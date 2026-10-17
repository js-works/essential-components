import { Badge, Group, Stack, Text } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import type { TableActions, TableColumns, TableFilters } from '@local/data-table/react';
import { multiRowAction, singleRowAction } from '@local/data-table/react';
import { AnchorLink, DataTable, useSavedTableFilters, useTableActions } from '@local/micro-app';

import type { AccessData, User } from '../../../domain/index.js';
import { groupsOf } from '../../../domain/index.js';
import { formatDateTime } from '../../../shared/lib/format.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { UserAvatar } from '../../../shared/ui/parts.js';
import { useGrantAccessFlow } from '../../access/index.js';
import { useTableSource } from '../../iam/index.js';
import { departmentFilter, userStatusFilter } from '../user-filters.js';
import { useCreateUserFlow, useDeleteUsersFlow, useEditUserFlow, useSetUsersActiveFlow } from '../user-flows.js';

export { UserTable };

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

const columns: TableColumns<UserRow> = [
  {
    key: 'name',
    header: 'Name',
    width: 3,
    sortable: true,
    render: (row) => (
      <Group gap={8} wrap="nowrap">
        <UserAvatar name={row.name} />
        <Stack gap={0} style={{ minWidth: 0 }}>
          <AnchorLink to="/users/$userId" params={{ userId: row.id }} size="sm" truncate>{row.name}</AnchorLink>
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
];

const filters: TableFilters = { department: departmentFilter, status: userStatusFilter };

function useActions(): TableActions<UserRow> {
  const { deleteAction, editAction, newAction, openAction } = useTableActions();
  const navigate = useNavigate();
  const createUser = useCreateUserFlow();
  const editUser = useEditUserFlow();
  const grantAccess = useGrantAccessFlow();
  const setActive = useSetUsersActiveFlow();
  const deleteUsers = useDeleteUsersFlow();

  return [
    newAction('New user', createUser),
    openAction((row) => navigate({ to: '/users/$userId', params: { userId: row.id } })),
    editAction(editUser),
    singleRowAction('grant', (row) => grantAccess({ principal: { type: 'user', id: row.id } }), {
      label: 'Grant access',
      icon: appIcons.access,
      show: 'toolbar',
    }),
    multiRowAction('enable', (rows) => setActive(rows, true), { label: 'Enable', icon: appIcons.enable }),
    multiRowAction('disable', (rows) => setActive(rows, false), { label: 'Disable', icon: appIcons.disable }),
    deleteAction(deleteUsers),
  ];
}

function UserTable() {
  const actions = useActions();
  const savedFilters = useSavedTableFilters('users');
  const source = useTableSource<UserRow>('users', userRows, {
    search: ['name', 'email', 'title', 'department', 'groups'],
  });

  return (
    <DataTable
      source={source}
      rowKey="id"
      columns={columns}
      filters={filters}
      actions={actions}
      searchable
      reloadable
      pageSizeOptions={[25, 50, 100]}
      savedFilters={savedFilters}
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
