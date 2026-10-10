import { Alert, Anchor, Badge, Button, Group, Stack, Tabs, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useToast } from '../../../../../packages/overlays/src/main/bindings/react';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader } from '../../../shared/ui/parts';
import { GrantsTable } from '../../access';
import { useAccessData, useChanged, useIamService } from '../../iam';
import { PermissionMatrix } from '../components/PermissionMatrix';
import { useRoleFlows } from '../flows';

export { RolePage };

// One role: its permissions (a matrix; edited in place, then "Save" or "Reset"), and where it is granted.
function RolePage(): ReactElement {
  const { roleId = '' } = useParams();
  const data = useAccessData();
  const service = useIamService();
  const changed = useChanged();
  const toasts = useToast();
  const flows = useRoleFlows();
  const navigate = useNavigate();
  const role = data?.roles.find((candidate) => candidate.id === roleId);
  const [draft, setDraft] = useState<readonly string[]>();
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(undefined), [roleId]);

  if (data === undefined) {
    return <></>;
  }

  if (role === undefined) {
    return (
      <Text p="md">
        This role does not exist (anymore). <Anchor component={Link} to="/roles">All roles</Anchor>
      </Text>
    );
  }

  const value = draft ?? role.permissionIds;
  const dirty = draft !== undefined
    && (draft.length !== role.permissionIds.length || draft.some((id) => !role.permissionIds.includes(id)));
  const grants = data.grants.filter((grant) => grant.roleId === role.id).length;

  const save = async () => {
    setSaving(true);

    try {
      await service.updateRole(role.id, { name: role.name, description: role.description, permissionIds: value });
      await changed();
      setDraft(undefined);
      toasts.success(`Role "${role.name}" saved`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Stack gap="md">
      <PageHeader
        title={role.name}
        subtitle={role.description}
        badges={role.builtIn ? <Badge variant="outline">Built-in</Badge> : undefined}
        actions={
          <>
            {!role.builtIn && (
              <Button
                size="xs"
                variant="default"
                leftSection={appIcons.edit}
                onClick={() => void flows.rename(role)}
              >
                Edit
              </Button>
            )}
            <Button size="xs" variant="default" leftSection={appIcons.copy} onClick={() => void flows.create(role)}>
              Duplicate
            </Button>
            {!role.builtIn && (
              <Button
                size="xs"
                variant="default"
                leftSection={appIcons.remove}
                onClick={async () => {
                  if (await flows.remove([role])) {
                    void navigate('/roles');
                  }
                }}
              >
                Delete
              </Button>
            )}
          </>
        }
      />
      <Tabs defaultValue="permissions" keepMounted={false}>
        <Tabs.List className="user-manager__tabs">
          <Tabs.Tab value="permissions">Permissions ({role.permissionIds.length})</Tabs.Tab>
          <Tabs.Tab value="granted">Granted ({grants})</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="permissions" pt="md">
          <Stack gap="md">
            {role.builtIn && (
              <Alert variant="light" color="gray">
                A built-in role cannot be changed. Duplicate it to make your own.
              </Alert>
            )}
            {!role.builtIn && (
              <Group justify="space-between" className="user-manager__save-bar" data-dirty={dirty || undefined}>
                <Text size="sm" c="dimmed">
                  {dirty ? 'Unsaved changes.' : 'Check the permissions this role gives.'}
                </Text>
                <Group gap="xs">
                  <Button
                    size="xs"
                    variant="default"
                    disabled={!dirty || saving}
                    onClick={() =>
                      setDraft(undefined)}
                  >
                    Reset
                  </Button>
                  <Button
                    size="xs"
                    disabled={!dirty}
                    loading={saving}
                    onClick={() =>
                      void save()}
                  >
                    Save
                  </Button>
                </Group>
              </Group>
            )}
            <PermissionMatrix
              permissions={data.permissions}
              scopes={data.scopes}
              value={value}
              {...(role.builtIn ? {} : { onChange: setDraft })}
            />
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="granted" pt="md">
          <GrantsTable
            name={`role:${role.id}`}
            filter={(grant) => grant.roleId === role.id}
            preset={{ roleId: role.id }}
            hide={['role']}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
