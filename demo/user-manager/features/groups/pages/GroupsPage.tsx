import { Anchor, Group as MantineGroup, Stack, Text, ThemeIcon } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDataNavigatorController } from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import type { AccessData, Group } from '../../../domain';
import { appIcons } from '../../../shared/ui/icons';
import { Navigator } from '../../../shared/ui/navigator';
import { PageHeader } from '../../../shared/ui/parts';
import { useGrantAccess } from '../../access';
import { useTableSource } from '../../iam';
import { useGroupFlows } from '../flows';

export { GroupsPage };

type GroupRow = Group & { members: number; grants: number };

function groupRows(data: AccessData): GroupRow[] {
  return data.groups.map((group) => ({
    ...group,
    members: group.memberIds.length,
    grants: data.grants.filter((grant) => grant.principal.type === 'group' && grant.principal.id === group.id).length,
  }));
}

// All groups: what a group is granted, its members get.
function GroupsPage(): ReactElement {
  const nav = useDataNavigatorController<GroupRow>();
  const navigate = useNavigate();
  const flows = useGroupFlows();
  const grantAccess = useGrantAccess();
  const source = useTableSource<GroupRow>('groups', groupRows, { search: ['name', 'description'] }, nav.reload);

  const columns = useMemo((): readonly DataNavigatorComponent.Column<GroupRow>[] => [
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
  ], []);

  const actions = useMemo((): readonly DataNavigatorComponent.Action<GroupRow>[] => [
    { type: 'general', key: 'new', label: 'New group', icon: appIcons.add, onClick: () => void flows.create() },
    {
      type: 'singleRow',
      key: 'open',
      icon: appIcons.open,
      tip: 'Open',
      show: 'column',
      default: true,
      onClick: (row) => void navigate(`/groups/${row.id}`),
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
      onClick: (row) => void grantAccess({ principal: { type: 'group', id: row.id } }),
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
      <PageHeader title="Groups" subtitle="Sets of users. Access granted to a group is its members' access." />
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
