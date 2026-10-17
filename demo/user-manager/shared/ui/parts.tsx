import { Avatar, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';

import { AnchorLink } from '@local/micro-app';

import type { AccessData, PrincipalRef } from '../../domain/index.js';
import { appIcons } from './icons.js';

export { PageHeader, PrincipalLabel, principalName, UserAvatar };

// The title of a page, its subtitle, and its actions on the right.
function PageHeader({ title, subtitle, badges, actions }: {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm" className="user-manager__page-header">
      <Stack gap={4}>
        <Group gap="xs">
          <Title order={2} size="h3">{title}</Title>
          {badges}
        </Group>
        {subtitle !== undefined && <Text size="sm" c="dimmed">{subtitle}</Text>}
      </Stack>
      {actions !== undefined && <Group gap="xs">{actions}</Group>}
    </Group>
  );
}

// A user's initials in a circle, in a color from their name.
function UserAvatar({ name, size = 26 }: { name: string; size?: number }) {
  return <Avatar name={name} color="initials" size={size} radius="xl" />;
}

function principalName(data: AccessData, principal: PrincipalRef): string {
  return principal.type === 'user'
    ? data.users.find((user) => user.id === principal.id)?.name ?? 'Unknown user'
    : data.groups.find((group) => group.id === principal.id)?.name ?? 'Unknown group';
}

// A user (avatar) or a group (group icon) with its name as a link to its page.
function PrincipalLabel({ data, principal }: { data: AccessData; principal: PrincipalRef }) {
  const name = principalName(data, principal);

  return (
    <Group gap={8} wrap="nowrap">
      {principal.type === 'user'
        ? <UserAvatar name={name} size={22} />
        : (
          <ThemeIcon size={22} radius="xl" variant="light" aria-hidden>
            {appIcons.groups}
          </ThemeIcon>
        )}
      {principal.type === 'user'
        ? <AnchorLink to="/users/$userId" params={{ userId: principal.id }} size="sm" truncate>{name}</AnchorLink>
        : <AnchorLink to="/groups/$groupId" params={{ groupId: principal.id }} size="sm" truncate>{name}</AnchorLink>}
    </Group>
  );
}
