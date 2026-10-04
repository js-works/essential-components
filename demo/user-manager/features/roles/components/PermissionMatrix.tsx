import { Badge, Checkbox, Group, Paper, Stack, Table, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { permissionParts } from '../../../domain';
import type { Permission, Scope } from '../../../domain';

export { PermissionMatrix };

// A role's permissions, by app: a row per resource, a checkbox per action (with its description as the tooltip), and
// one per row and per app for all of them. Read only without `onChange` (a built-in role).
function PermissionMatrix({ permissions, scopes, value, onChange }: {
  permissions: readonly Permission[];
  scopes: readonly Scope[];
  value: readonly string[];
  onChange?: (value: readonly string[]) => void;
}): ReactElement {
  const chosen = new Set(value);
  const apps = [...new Set(permissions.map((permission) => permission.app))];
  const toggle = (ids: readonly string[], on: boolean) => {
    const next = new Set(chosen);

    for (const id of ids) {
      if (on) {
        next.add(id);
      } else {
        next.delete(id);
      }
    }

    onChange?.(permissions.map((permission) => permission.id).filter((id) => next.has(id)));
  };
  const state = (ids: readonly string[]) => {
    const count = ids.filter((id) => chosen.has(id)).length;

    return { checked: count === ids.length && count > 0, indeterminate: count > 0 && count < ids.length, count };
  };

  return (
    <Stack gap="md">
      {apps.map((app) => {
        const appPermissions = permissions.filter((permission) => permission.app === app);
        const resources = [...new Set(appPermissions.map((permission) => permissionParts(permission.id).resource))];
        const all = state(appPermissions.map((permission) => permission.id));

        return (
          <Paper key={app} withBorder radius="sm">
            <Group justify="space-between" px="md" py="xs" className="user-manager__matrix-head">
              <Checkbox
                label={<Text fw={600} size="sm">{scopes.find((scope) => scope.id === `s-${app}`)?.name ?? app}</Text>}
                checked={all.checked}
                indeterminate={all.indeterminate}
                disabled={onChange === undefined}
                onChange={(event) =>
                  toggle(appPermissions.map((permission) => permission.id), event.currentTarget.checked)}
              />
              <Badge variant="light">{all.count} / {appPermissions.length}</Badge>
            </Group>
            <Table verticalSpacing={8} horizontalSpacing="md">
              <Table.Tbody>
                {resources.map((resource) => {
                  const ids = appPermissions.filter((permission) =>
                    permissionParts(permission.id).resource === resource
                  );
                  const row = state(ids.map((permission) => permission.id));

                  return (
                    <Table.Tr key={resource}>
                      <Table.Td w={170}>
                        <Checkbox
                          label={<Text size="sm" tt="capitalize">{resource}</Text>}
                          checked={row.checked}
                          indeterminate={row.indeterminate}
                          disabled={onChange === undefined}
                          onChange={(event) =>
                            toggle(ids.map((permission) => permission.id), event.currentTarget.checked)}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Group gap="lg">
                          {ids.map((permission) => (
                            <Checkbox
                              key={permission.id}
                              size="xs"
                              label={permissionParts(permission.id).action}
                              title={`${permission.id}: ${permission.description}`}
                              checked={chosen.has(permission.id)}
                              disabled={onChange === undefined}
                              onChange={(event) => toggle([permission.id], event.currentTarget.checked)}
                            />
                          ))}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Paper>
        );
      })}
    </Stack>
  );
}
