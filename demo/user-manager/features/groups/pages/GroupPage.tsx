import { Anchor, Badge, Button, Group as MantineGroup, Stack, Tabs, Text } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useDataNavigatorController } from '../../../../../packages/data-navigator/src/react';
import type { DataNavigatorComponent } from '../../../../../packages/data-navigator/src/react';
import { useDialogs, useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { membersOf } from '../../../domain';
import type { Group, User } from '../../../domain';
import { countText } from '../../../shared/lib/format';
import { appIcons } from '../../../shared/ui/icons';
import { Navigator } from '../../../shared/ui/navigator';
import { PageHeader, UserAvatar } from '../../../shared/ui/parts';
import { GrantsTable } from '../../access';
import { useAccessData, useChanged, useIamService, useTableSource } from '../../iam';
import { AddMembersForm } from '../components/AddMembersForm';
import { useGroupFlows } from '../flows';

export { GroupPage };

// The members of a group: add (a checklist of the others), remove.
function MembersTable({ group }: { group: Group }): ReactElement {
  const nav = useDataNavigatorController<User>();
  const data = useAccessData();
  const service = useIamService();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = useChanged();
  const source = useTableSource<User>(
    `members:${group.id}`,
    (all) => {
      const current = all.groups.find((candidate) => candidate.id === group.id);

      return current === undefined ? [] : membersOf(all.users, current);
    },
    { search: ['name', 'email', 'department', 'title'] },
    nav.reload,
  );

  const columns = useMemo((): readonly DataNavigatorComponent.Column<User>[] => [
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
  ], []);

  const actions = useMemo((): readonly DataNavigatorComponent.Action<User>[] => {
    const add = async () => {
      if (data === undefined) {
        return;
      }

      let added: readonly string[] = [];
      const current = data.groups.find((candidate) => candidate.id === group.id) ?? group;
      const result = await dialogs.form({
        title: `Add members to "${group.name}"`,
        content: (
          <AddMembersForm
            candidates={data.users.filter((user) => !current.memberIds.includes(user.id))}
            save={async (userIds) => {
              await service.addMembers(group.id, userIds);
              added = userIds;
            }}
          />
        ),
        buttons: { confirm: 'Add' },
      });

      if (!result.canceled) {
        await changed();
        toasts.success(`${added.length === 1 ? '1 member' : `${added.length} members`} added`);
      }
    };

    const remove = async (users: readonly User[]) => {
      await service.removeMembers(group.id, users.map((user) => user.id));
      await changed();
      toasts.success(`${countText(users.map((user) => user.name), 'members')} removed from "${group.name}"`);
    };

    return [
      { type: 'general', key: 'add', label: 'Add members', icon: appIcons.addUser, onClick: () => void add() },
      {
        type: 'singleRow',
        key: 'remove-row',
        icon: appIcons.removeUser,
        tip: 'Remove from group',
        show: 'column',
        contextMenu: false,
        onClick: (row) => void remove([row]),
      },
      {
        type: 'multiRow',
        key: 'remove',
        label: 'Remove',
        icon: appIcons.removeUser,
        onClick: (rows) => void remove(rows),
      },
    ];
  }, [data, group, dialogs, toasts, service, changed]);

  return (
    <Navigator
      controller={nav}
      source={source}
      rowKey="id"
      columns={columns}
      actions={actions}
      searchable
      pageSize={10}
      pageSizeOptions={[10, 25, 50]}
      defaultSort={{ key: 'name', direction: 'asc' }}
      empty="No members yet."
    />
  );
}

// One group: its members, and the access granted to it (its members' access).
function GroupPage(): ReactElement {
  const { groupId = '' } = useParams();
  const data = useAccessData();
  const flows = useGroupFlows();
  const navigate = useNavigate();
  const group = data?.groups.find((candidate) => candidate.id === groupId);

  if (data === undefined) {
    return <></>;
  }

  if (group === undefined) {
    return (
      <Text p="md">
        This group does not exist (anymore). <Anchor component={Link} to="/groups">All groups</Anchor>
      </Text>
    );
  }

  const grants =
    data.grants.filter((grant) => grant.principal.type === 'group' && grant.principal.id === group.id).length;

  return (
    <Stack gap="md">
      <PageHeader
        title={group.name}
        subtitle={group.description}
        badges={<Badge variant="light">{group.memberIds.length} members</Badge>}
        actions={
          <>
            <Button size="xs" variant="default" leftSection={appIcons.edit} onClick={() => void flows.edit(group)}>
              Edit
            </Button>
            <Button
              size="xs"
              variant="default"
              leftSection={appIcons.remove}
              onClick={async () => {
                if (await flows.remove([group])) {
                  void navigate('/groups');
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />
      <Tabs defaultValue="members" keepMounted={false}>
        <Tabs.List className="user-manager__tabs">
          <Tabs.Tab value="members">Members ({group.memberIds.length})</Tabs.Tab>
          <Tabs.Tab value="access">Granted access ({grants})</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="members" pt="md">
          <MembersTable group={group} />
        </Tabs.Panel>
        <Tabs.Panel value="access" pt="md">
          <GrantsTable
            name={`group:${group.id}`}
            filter={(grant) => grant.principal.type === 'group' && grant.principal.id === group.id}
            preset={{ principal: { type: 'group', id: group.id } }}
            hide={['who']}
            subtitle="Every member gets this access."
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
