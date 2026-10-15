import {
  defineActions,
  defineColumns,
  multiRowAction,
  singleRowAction,
  useDataTableController,
} from '@local/data-table/react';
import { Anchor, Badge, Group as MantineGroup } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { membersOf } from '../../../domain/index.js';
import type { Group, User } from '../../../domain/index.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { UserAvatar } from '../../../shared/ui/parts.js';
import { newAction } from '../../../shared/ui/tableActions.js';
import { useTableSource } from '../../iam/index.js';
import { useGroupFlows } from '../flows.js';
import type { GroupFlows } from '../flows.js';

export { MemberTable };

// The columns of a group's members.
const columns = defineColumns<User>([
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
]);

// The actions of a group's members: add (a checklist of the others), remove one (in its row) or the selected ones.
const actionsOf = (flows: GroupFlows, group: Group) =>
  defineActions<User>([
    newAction('Add members', () => flows.addMembers(group), { key: 'add' }),
    singleRowAction('remove-row', (row) => flows.removeMembers(group, [row]), {
      icon: appIcons.removeUser,
      tip: 'Remove from group',
      show: 'column',
      contextMenu: false,
    }),
    multiRowAction('remove', (rows) => flows.removeMembers(group, rows), {
      label: 'Remove',
      icon: appIcons.removeUser,
    }),
  ]);

// The members of a group: add, remove.
function MemberTable({ group }: { group: Group }): ReactElement {
  const nav = useDataTableController<User>();
  const flows = useGroupFlows();
  const source = useTableSource<User>(
    `members:${group.id}`,
    (all) => {
      const current = all.groups.find((candidate) => candidate.id === group.id);

      return current === undefined ? [] : membersOf(all.users, current);
    },
    { search: ['name', 'email', 'department', 'title'] },
    nav.reload,
  );

  return (
    <DataTable
      controller={nav}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actionsOf(flows, group)}
      searchable
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'name', direction: 'asc' }}
      empty="No members yet."
    />
  );
}
