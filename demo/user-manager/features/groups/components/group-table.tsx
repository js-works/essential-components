import { Group as MantineGroup, Text, ThemeIcon } from '@mantine/core';
import { useNavigate } from '@tanstack/react-router';

import type { TableActions, TableColumns } from '@local/data-table/react';
import { singleRowAction } from '@local/data-table/react';
import { AnchorLink, DataTable, useTableActions } from '@local/micro-app';

import type { AccessData, Group } from '../../../domain/index.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { useGrantAccessFlow } from '../../access/index.js';
import { useTableSource } from '../../iam/index.js';
import { useCreateGroupFlow, useDeleteGroupsFlow, useEditGroupFlow } from '../group-flows.js';

export { GroupTable };

type GroupRow = Group & { members: number; grants: number };

function groupRows(data: AccessData): GroupRow[] {
  return data.groups.map((group) => ({
    ...group,
    members: group.memberIds.length,
    grants: data.grants.filter((grant) => grant.principal.type === 'group' && grant.principal.id === group.id).length,
  }));
}

const columns: TableColumns<GroupRow> = [
  {
    key: 'name',
    header: 'Name',
    width: 2.5,
    sortable: true,
    render: (row) => (
      <MantineGroup gap={8} wrap="nowrap">
        <ThemeIcon size={24} radius="xl" variant="light" aria-hidden>{appIcons.groups}</ThemeIcon>
        <AnchorLink to="/groups/$groupId" params={{ groupId: row.id }} size="sm" truncate>{row.name}</AnchorLink>
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
];

function useActions(): TableActions<GroupRow> {
  const { deleteAction, editAction, newAction, openAction } = useTableActions();
  const navigate = useNavigate();
  const createGroup = useCreateGroupFlow();
  const editGroup = useEditGroupFlow();
  const grantAccess = useGrantAccessFlow();
  const deleteGroups = useDeleteGroupsFlow();

  return [
    newAction('New group', createGroup),
    openAction((row) => navigate({ to: '/groups/$groupId', params: { groupId: row.id } })),
    editAction(editGroup),
    singleRowAction('grant', (row) => grantAccess({ principal: { type: 'group', id: row.id } }), {
      label: 'Grant access',
      icon: appIcons.access,
      show: 'toolbar',
    }),
    deleteAction(deleteGroups),
  ];
}

function GroupTable() {
  const actions = useActions();
  const source = useTableSource<GroupRow>('groups', groupRows, { search: ['name', 'description'] });

  return (
    <DataTable
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      defaultSort={{ key: 'name', direction: 'asc' }}
    />
  );
}
