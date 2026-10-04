import { Alert, Grid, Group, Paper, Select, Stack, Text, ThemeIcon } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { checkAccess, scopeLabel } from '../../../domain';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader } from '../../../shared/ui/parts';
import { useAccessData } from '../../iam';
import { ReasonText } from '../components/EffectivePermissions';
import { ScopePicker } from '../components/ScopePicker';

export { CheckAccessPage };

// "May this user do this here?": a user, a permission and a scope give the answer, with every reason that allows it
// (a disabled user: never).
function CheckAccessPage(): ReactElement {
  const data = useAccessData();
  const [userId, setUserId] = useState<string | null>(null);
  const [permissionId, setPermissionId] = useState<string | null>(null);
  const [scopeId, setScopeId] = useState<string>();

  if (data === undefined) {
    return <></>;
  }

  const decision = userId !== null && permissionId !== null && scopeId !== undefined
    ? checkAccess(data, userId, permissionId, scopeId)
    : undefined;
  const user = data.users.find((candidate) => candidate.id === userId);

  return (
    <Stack gap="md">
      <PageHeader title="Check access" subtitle="May a user do something somewhere? And why." />
      <Grid gap="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="sm">
            <Select
              label="User"
              placeholder="Choose a user"
              searchable
              data={[...data.users].sort((a, b) => a.name.localeCompare(b.name)).map((candidate) => ({
                value: candidate.id,
                label: candidate.active ? candidate.name : `${candidate.name} (disabled)`,
              }))}
              value={userId}
              onChange={setUserId}
            />
            <Select
              label="Permission"
              placeholder="Choose a permission"
              searchable
              data={[...new Set(data.permissions.map((permission) => permission.app))].map((app) => ({
                group: data.scopes.find((scope) => scope.id === `s-${app}`)?.name ?? app,
                items: data.permissions.filter((permission) => permission.app === app).map((permission) => ({
                  value: permission.id,
                  label: `${permission.id} · ${permission.description}`,
                })),
              }))}
              value={permissionId}
              onChange={setPermissionId}
            />
            <Stack gap={4}>
              <Text size="sm" fw={500}>Where</Text>
              <ScopePicker scopes={data.scopes} value={scopeId} onChange={setScopeId} height={320} />
            </Stack>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          {decision === undefined
            ? (
              <Paper withBorder p="lg" radius="sm">
                <Text size="sm" c="dimmed">Choose a user, a permission and where, to see the answer.</Text>
              </Paper>
            )
            : (
              <Paper withBorder p="lg" radius="sm">
                <Stack gap="sm">
                  <Group gap="sm" wrap="nowrap">
                    <ThemeIcon size="lg" radius="xl" color={decision.allowed ? 'success' : 'danger'} aria-hidden>
                      {decision.allowed ? appIcons.allowed : appIcons.denied}
                    </ThemeIcon>
                    <Text fw={600}>
                      {decision.allowed ? 'Allowed' : 'Denied'}: {user?.name} · {permissionId} ·{' '}
                      {scopeLabel(data.scopes, scopeId ?? '')}
                    </Text>
                  </Group>
                  {decision.disabled && <Alert color="danger" variant="light">This user is disabled.</Alert>}
                  {decision.reasons.length > 0
                    ? (
                      <Stack gap={4}>
                        <Text size="sm" fw={500}>{decision.allowed ? 'Because of' : 'Granted, but not in effect'}</Text>
                        {decision.reasons.map((reason) => (
                          <ReasonText key={reason.grant.id} data={data} reason={reason} />
                        ))}
                      </Stack>
                    )
                    : (
                      <Text size="sm" c="dimmed">
                        No grant gives this permission here: not to the user, not to their groups, not on this scope or
                        one above it.
                      </Text>
                    )}
                </Stack>
              </Paper>
            )}
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
