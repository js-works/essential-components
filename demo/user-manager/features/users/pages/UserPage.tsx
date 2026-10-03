import { Anchor, Badge, Button, Group, Paper, SimpleGrid, Stack, Tabs, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { effectivePermissions, groupsOf } from '../../../domain';
import { formatDateTime } from '../../../shared/lib/format';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader, UserAvatar } from '../../../shared/ui/parts';
import { EffectivePermissions, GrantsTable } from '../../access';
import { useAccessData } from '../../iam';
import { useUserFlows } from '../flows';

export { UserPage };

// One user: their data and groups, the access granted to them (directly), and everything they may do (effective,
// with the reasons).
function UserPage(): ReactElement {
  const { userId = '' } = useParams();
  const data = useAccessData();
  const flows = useUserFlows();
  const navigate = useNavigate();
  const user = data?.users.find((candidate) => candidate.id === userId);

  if (data === undefined) {
    return <></>;
  }

  if (user === undefined) {
    return (
      <Text p="md">
        This user does not exist (anymore). <Anchor component={Link} to="/users">All users</Anchor>
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
          <Badge variant="light" color={user.active ? 'success' : 'gray'}>{user.active ? 'Active' : 'Disabled'}</Badge>
        }
        actions={
          <>
            <Button size="xs" variant="default" leftSection={appIcons.edit} onClick={() => void flows.edit(user)}>
              Edit
            </Button>
            <Button
              size="xs"
              variant="default"
              leftSection={user.active ? appIcons.disable : appIcons.enable}
              onClick={() => void flows.setActive([user], !user.active)}
            >
              {user.active ? 'Disable' : 'Enable'}
            </Button>
            <Button
              size="xs"
              variant="default"
              color="danger"
              leftSection={appIcons.remove}
              onClick={async () => {
                if (await flows.remove([user])) {
                  void navigate('/users');
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
                      component={Link}
                      to={`/groups/${group.id}`}
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
          <GrantsTable
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
