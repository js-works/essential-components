import { Group, Paper, SimpleGrid, Stack, Text, ThemeIcon, Title, UnstyledButton } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';
import { appIcons } from '../../shared/ui/icons';
import { useAccessData } from '../iam';

export { HomePage };

function Card({ to, icon, title, text }: { to: string; icon: ReactNode; title: string; text: string }): ReactElement {
  return (
    <UnstyledButton component={Link} to={to}>
      <Paper withBorder p="md" radius="sm" className="user-manager__card">
        <Group gap="md" wrap="nowrap">
          <ThemeIcon size="lg" variant="light" aria-hidden>{icon}</ThemeIcon>
          <Stack gap={0}>
            <Text fw={600}>{title}</Text>
            <Text size="sm" c="dimmed">{text}</Text>
          </Stack>
        </Group>
      </Paper>
    </UnstyledButton>
  );
}

// The start: what there is, and how access works.
function HomePage(): ReactElement {
  const data = useAccessData();

  if (data === undefined) {
    return <></>;
  }

  const active = data.users.filter((user) => user.active).length;

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={2} size="h3">Overview</Title>
        <Text size="sm" c="dimmed">
          Who may do what, where: users and groups get roles (sets of permissions) on scopes (the organization, an app,
          a folder, a board, ...). A role on a scope applies to everything below it. All data is made up and lives in
          this page only.
        </Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="md">
        <Card to="/users" icon={appIcons.users} title="Users" text={`${data.users.length} users, ${active} active`} />
        <Card to="/groups" icon={appIcons.groups} title="Groups" text={`${data.groups.length} groups`} />
        <Card
          to="/roles"
          icon={appIcons.roles}
          title="Roles"
          text={`${data.roles.length} roles, ${data.permissions.length} permissions`}
        />
        <Card to="/access" icon={appIcons.access} title="Access" text={`${data.grants.length} grants`} />
        <Card to="/check" icon={appIcons.check} title="Check access" text="May a user do this here? And why." />
        <Card to="/permissions" icon={appIcons.roles} title="Permissions" text="What the apps register" />
      </SimpleGrid>
    </Stack>
  );
}
