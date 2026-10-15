import { defineActions, defineColumns, singleRowAction, useDataTableController } from '@local/data-table/react';
import { Anchor, Group as MantineGroup, Stack, Text, ThemeIcon } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import type { NavigateFunction } from 'react-router';
import type { AccessData, Group } from '../../../domain/index.js';
import { DataTable } from '../../../shared/ui/dataTable.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { PageHeader } from '../../../shared/ui/parts.js';
import { deleteAction, editAction, newAction, openAction } from '../../../shared/ui/tableActions.js';
import { useGrantFlows } from '../../access/index.js';
import type { GrantFlows } from '../../access/index.js';
import { useTableSource } from '../../iam/index.js';
import { useGroupFlows } from '../flows.js';
import type { GroupFlows } from '../flows.js';

export { GroupsPage };

type GroupRow = Group & { members: number; grants: number };

function groupRows(data: AccessData): GroupRow[] {
  return data.groups.map((group) => ({
    ...group,
    members: group.memberIds.length,
    grants: data.grants.filter((grant) => grant.principal.type === 'group' && grant.principal.id === group.id).length,
  }));
}

// The columns of the groups list.
const columns = defineColumns<GroupRow>([
  {
    key: 'name',
    header: 'Name',
    width: 2.5,
    sortable: true,
    render: (row) => (
      <MantineGroup gap={8} wrap="nowrap">
        <ThemeIcon size={24} radius="xl" variant="light" aria-hidden>{appIcons.groups}</ThemeIcon>
        <Anchor component={Link} to={`/groups/${row.id}`} size="sm" truncate>{row.name}</Anchor>
      </MantineGroup>
    ),
  },
  {
    key: 'description',
    header: 'Description',
    width: 4,
    hideable: true,
    render: (row) => <Text size="sm" truncate>{row.description}</Text>,
  },
  { key: 'members', header: 'Members', width: 1.2, sortable: true, align: 'end' },
  { key: 'grants', header: 'Grants', width: 1.2, sortable: true, align: 'end', hideable: true },
]);

// What the actions of the groups list need: the flows of groups and grants, and where a group opens.
type GroupListContext = { flows: GroupFlows; grants: GrantFlows; navigate: NavigateFunction };

// The actions of the groups list: new, open (the default action), edit, grant access, delete.
const actionsOf = ({ flows, grants, navigate }: GroupListContext) =>
  defineActions<GroupRow>([
    newAction('New group', () => flows.create()),
    openAction((row) => navigate(`/groups/${row.id}`)),
    editAction((row) => flows.edit(row)),
    singleRowAction('grant', (row) => grants.grant({ principal: { type: 'group', id: row.id } }), {
      label: 'Grant access',
      icon: appIcons.access,
      show: 'toolbar',
    }),
    deleteAction((rows) => flows.remove(rows)),
  ]);

// All groups: what a group is granted, its members get.
function GroupsPage(): ReactElement {
  const nav = useDataTableController<GroupRow>();
  const ctx = { flows: useGroupFlows(), grants: useGrantFlows(), navigate: useNavigate() };
  const source = useTableSource<GroupRow>('groups', groupRows, { search: ['name', 'description'] }, nav.reload);

  return (
    <Stack gap="md">
      <PageHeader title="Groups" subtitle="Sets of users. Access granted to a group is its members' access." />
      <DataTable
        controller={nav}
        source={source}
        rowKey="id"
        columns={columns}
        actions={actionsOf(ctx)}
        searchable
        defaultSort={{ key: 'name', direction: 'asc' }}
      />
    </Stack>
  );
}
