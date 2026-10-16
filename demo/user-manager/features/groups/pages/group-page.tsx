import { Anchor, Badge, Button, Stack, Tabs, Text } from '@mantine/core';
import { Link, useNavigate, useParams } from 'react-router';
import { appIcons } from '../../../shared/ui/icons.js';
import { PageHeader } from '../../../shared/ui/parts.js';
import { GrantTable } from '../../access/index.js';
import { useAccessData } from '../../iam/index.js';
import { MemberTable } from '../components/member-table.js';
import { useDeleteGroupsFlow, useEditGroupFlow } from '../group-flows.js';

export { GroupPage };

// One group: its members, and the access granted to it (its members' access).
function GroupPage() {
  const { groupId = '' } = useParams();
  const data = useAccessData();
  const editGroup = useEditGroupFlow();
  const deleteGroups = useDeleteGroupsFlow();
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
            <Button size="xs" variant="default" leftSection={appIcons.edit} onClick={() => void editGroup(group)}>
              Edit
            </Button>
            <Button
              size="xs"
              variant="default"
              leftSection={appIcons.remove}
              onClick={async () => {
                if (await deleteGroups([group])) {
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
          <MemberTable group={group} />
        </Tabs.Panel>
        <Tabs.Panel value="access" pt="md">
          <GrantTable
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
