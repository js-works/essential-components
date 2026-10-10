import { Badge, Group, Stack, Table, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { effectivePermissions, scopeLabel } from '../../../domain';
import type { AccessData, Reason } from '../../../domain';

export { EffectivePermissions, ReasonText };

// Why: "Media editor on File Center › Marketing, via group Marketing" (or "directly").
function ReasonText({ data, reason }: { data: AccessData; reason: Reason }): ReactElement {
  return (
    <Text size="xs" c="dimmed">
      {reason.role.name} on {scopeLabel(data.scopes, reason.scope.id)}
      {reason.via.type === 'group' ? `, via group ${reason.via.group.name}` : ', directly'}
    </Text>
  );
}

// Everything a user may do, by app: each permission, where it applies, and why (the grants that give it).
function EffectivePermissions({ data, userId }: { data: AccessData; userId: string }): ReactElement {
  const user = data.users.find((candidate) => candidate.id === userId);
  const entries = effectivePermissions(data, userId);
  const apps = [...new Set(entries.map((entry) => entry.permission.app))];

  if (entries.length === 0) {
    return <Text size="sm" c="dimmed">This user has no permissions.</Text>;
  }

  return (
    <Stack gap="lg">
      {user !== undefined && !user.active && (
        <Text size="sm" c="red">This user is disabled: none of these permissions apply now.</Text>
      )}
      {apps.map((app) => (
        <Stack key={app} gap={6}>
          <Group gap="xs">
            <Text fw={600} size="sm">{data.scopes.find((scope) => scope.id === `s-${app}`)?.name ?? app}</Text>
            <Badge variant="light" size="sm">{entries.filter((entry) => entry.permission.app === app).length}</Badge>
          </Group>
          <Table withTableBorder verticalSpacing={6} fz="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th w="35%">Permission</Table.Th>
                <Table.Th>Where and why</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {entries.filter((entry) => entry.permission.app === app).map(({ permission, reasons }) => (
                <Table.Tr key={permission.id}>
                  <Table.Td style={{ verticalAlign: 'top' }}>
                    <Text size="sm" ff="monospace">{permission.id}</Text>
                    <Text size="xs" c="dimmed">{permission.description}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Stack gap={2}>
                      {reasons.map((reason) => <ReasonText key={reason.grant.id} data={data} reason={reason} />)}
                    </Stack>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Stack>
      ))}
    </Stack>
  );
}
