import { Anchor, Badge, Group as MantineGroup } from '@mantine/core';
import { Link } from 'react-router';

import type { TableActions, TableColumns } from '@local/data-table/react';
import { multiRowAction, singleRowAction } from '@local/data-table/react';

import type { Group, User } from '../../../domain/index.js';
import { membersOf } from '../../../domain/index.js';
import { DataTable } from '../../../shared/ui/data-table.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { UserAvatar } from '../../../shared/ui/parts.js';
import { newAction } from '../../../shared/ui/table-actions.js';
import { useTableSource } from '../../iam/index.js';
import { useAddMembersFlow, useRemoveMembersFlow } from '../group-flows.js';

export { MemberTable };

const columns: TableColumns<User> = [
  {
    key: 'name',
    header: 'Name',
    width: 3,
    sortable: true,
    render: (row) => (
      <MantineGroup gap={8} wrap="nowrap">
        <UserAvatar name={row.name} size={22} />
        <Anchor component={Link} to={`/users/${row.id}`} size="sm" truncate>{row.name}</Anchor>
        {!row.active && <Badge size="xs" variant="light" color="gray">Disabled</Badge>}
      </MantineGroup>
    ),
  },
  { key: 'title', header: 'Title', width: 2.5, hideable: true },
  { key: 'department', header: 'Department', width: 2, sortable: true, hideable: true },
];

function useActions(group: Group): TableActions<User> {
  const addMembers = useAddMembersFlow();
  const removeMembers = useRemoveMembersFlow();

  return [
    newAction('Add members', () => addMembers(group), { key: 'add' }),
    singleRowAction('remove-row', (row) => removeMembers(group, [row]), {
      icon: appIcons.removeUser,
      tip: 'Remove from group',
      show: 'column',
      contextMenu: false,
    }),
    multiRowAction('remove', (rows) => removeMembers(group, rows), { label: 'Remove', icon: appIcons.removeUser }),
  ];
}

// The members of a group: add, remove.
function MemberTable({ group }: { group: Group }) {
  const actions = useActions(group);
  const source = useTableSource<User>(
    `members:${group.id}`,
    (all) => {
      const current = all.groups.find((candidate) => candidate.id === group.id);

      return current === undefined ? [] : membersOf(all.users, current);
    },
    { search: ['name', 'email', 'department', 'title'] },
  );

  return (
    <DataTable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'name', direction: 'asc' }}
      empty="No members yet."
    />
  );
}
