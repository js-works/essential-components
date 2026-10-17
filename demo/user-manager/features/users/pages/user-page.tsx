import { Badge, Button, Group, Paper, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import { Link, useNavigate, useParams } from '@tanstack/react-router';

import { AnchorLink } from '@local/micro-app';

import { effectivePermissions, groupsOf } from '../../../domain/index.js';
import { formatDateTime } from '../../../shared/lib/format.js';
import { appIcons } from '../../../shared/ui/icons.js';
import { PageHeader, UserAvatar } from '../../../shared/ui/parts.js';
import { EffectivePermissions, GrantTable } from '../../access/index.js';
import { useAccessData } from '../../iam/index.js';
import { useDeleteUsersFlow, useEditUserFlow, useSetUsersActiveFlow } from '../user-flows.js';

export { UserPage };

// One user: their data and groups, the access granted to them (directly), and everything they may do (effective,
// with the reasons).
function UserPage() {
  const { userId } = useParams({ from: '/users/$userId' });
  const data = useAccessData();
  const editUser = useEditUserFlow();
  const setUsersActive = useSetUsersActiveFlow();
  const deleteUsers = useDeleteUsersFlow();
  const navigate = useNavigate();
  const user = data?.users.find((candidate) => candidate.id === userId);

  if (data === undefined) {
    return <></>;
  }

  if (user === undefined) {
    return (
      <Text p="md">
        This user does not exist (anymore). <AnchorLink to="/users">All users</AnchorLink>
      </Text>
    );
  }

  const groups = groupsOf(data.groups, user.id);
  const permissions = effectivePermissions(data, user.id).length;

  return (
    <Stack gap="md">
      <PageHeader
        title={
          <Group gap="sm" component="span">
            <UserAvatar name={user.name} size={36} />
            {user.name}
          </Group>
        }
        subtitle={`${user.title} · ${user.department}`}
        badges={
          <Badge variant="light" color={user.active ? undefined : 'gray'}>{user.active ? 'Active' : 'Disabled'}</Badge>
        }
        actions={
          <>
            <Button size="xs" variant="default" leftSection={appIcons.edit} onClick={() => void editUser(user)}>
              Edit
            </Button>
            <Button
              size="xs"
              variant="default"
              leftSection={user.active ? appIcons.disable : appIcons.enable}
              onClick={() => void setUsersActive([user], !user.active)}
            >
              {user.active ? 'Disable' : 'Enable'}
            </Button>
            <Button
              size="xs"
              variant="default"
              color="danger"
              leftSection={appIcons.remove}
              onClick={async () => {
                if (await deleteUsers([user])) {
                  void navigate({ to: '/users' });
                }
              }}
            >
              Delete
            </Button>
          </>
        }
      />
      <Tabs defaultValue="overview" keepMounted={false}>
        <Tabs.List className="user-manager__tabs">
          <Tabs.Tab value="overview">Overview</Tabs.Tab>
          <Tabs.Tab value="access">Granted access</Tabs.Tab>
          <Tabs.Tab value="effective">Effective permissions ({permissions})</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview" pt="md">
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            <Paper withBorder p="md" radius="sm">
              <Stack gap={6}>
                <Text fw={600} size="sm">Details</Text>
                {[
                  ['Email', user.email],
                  ['Title', user.title],
                  ['Department', user.department],
                  ['Created', formatDateTime(user.created)],
                ].map(([label, value]) => (
                  <Group key={label} gap="xs" wrap="nowrap">
                    <Text size="sm" c="dimmed" w={96}>{label}</Text>
                    <Text size="sm">{value}</Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
            <Paper withBorder p="md" radius="sm">
              <Stack gap={6}>
                <Text fw={600} size="sm">Groups ({groups.length})</Text>
                {groups.length === 0 && <Text size="sm" c="dimmed">Not in any group.</Text>}
                <Group gap={6}>
                  {groups.map((group) => (
                    <Badge
                      key={group.id}
                      renderRoot={(props) => <Link to="/groups/$groupId" params={{ groupId: group.id }} {...props} />}
                      variant="light"
                      style={{ cursor: 'pointer' }}
                    >
                      {group.name}
                    </Badge>
                  ))}
                </Group>
              </Stack>
            </Paper>
          </SimpleGrid>
        </Tabs.Panel>
        <Tabs.Panel value="access" pt="md">
          <GrantTable
            name={`user:${user.id}`}
            filter={(grant) => grant.principal.type === 'user' && grant.principal.id === user.id}
            preset={{ principal: { type: 'user', id: user.id } }}
            hide={['who']}
            subtitle="Granted to this user directly. Their groups' access is in the effective permissions."
          />
        </Tabs.Panel>
        <Tabs.Panel value="effective" pt="md">
          <EffectivePermissions data={data} userId={user.id} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
