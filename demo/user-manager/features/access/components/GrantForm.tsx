import { NativeSelect, Stack, Text } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';
import { scopeLabel } from '../../../domain';
import type { AccessData, PrincipalRef } from '../../../domain';
import { useDialogSave } from '../../../shared/lib/useDialogSave';
import { ScopePicker } from './ScopePicker';

export { GrantForm };

// "Grant access", as the content of a form dialog: who (a user or a group), which role, where (a scope). Any of them
// may be given (e.g. the user of the page it is opened on). Native selects: a Mantine select would open outside the
// modal dialog.
function GrantForm({ data, principal, roleId, scopeId, save }: {
  data: AccessData;
  principal?: PrincipalRef;
  roleId?: string;
  scopeId?: string;
  save: (principal: PrincipalRef, roleId: string, scopeId: string) => Promise<void>;
}): ReactElement {
  const [who, setWho] = useState(principal === undefined ? '' : `${principal.type}:${principal.id}`);
  const [role, setRole] = useState(roleId ?? '');
  const [scope, setScope] = useState<string | undefined>(scopeId);
  const { error, setError, confirm } = useDialogSave(
    () =>
      who === ''
        ? 'Please choose who gets access.'
        : role === ''
        ? 'Please choose a role.'
        : scope === undefined
        ? 'Please choose where.'
        : undefined,
    async () => {
      const [type, id = ''] = who.split(':') as ['user' | 'group', string];

      await save({ type, id }, role, scope ?? '');
    },
  );
  const sorted = <T extends { name: string }>(items: readonly T[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Form confirm={confirm}>
      <Stack gap="sm">
        <NativeSelect
          label="Who"
          value={who}
          onChange={(event) => {
            setWho(event.currentTarget.value);
            setError(undefined);
          }}
          data={[
            { value: '', label: 'Choose a user or a group…' },
            {
              group: 'Groups',
              items: sorted(data.groups).map((group) => ({ value: `group:${group.id}`, label: group.name })),
            },
            {
              group: 'Users',
              items: sorted(data.users).map((user) => ({
                value: `user:${user.id}`,
                label: user.active ? user.name : `${user.name} (disabled)`,
              })),
            },
          ]}
        />
        <NativeSelect
          label="Role"
          value={role}
          onChange={(event) => {
            setRole(event.currentTarget.value);
            setError(undefined);
          }}
          data={[
            { value: '', label: 'Choose a role…' },
            ...sorted(data.roles).map((candidate) => ({ value: candidate.id, label: candidate.name })),
          ]}
        />
        <Stack gap={4}>
          <Text size="sm" fw={500}>Where</Text>
          <ScopePicker
            scopes={data.scopes}
            value={scope}
            onChange={(id) => {
              setScope(id);
              setError(undefined);
            }}
          />
          <Text size="xs" c="dimmed">
            {scope === undefined
              ? 'The role applies to the chosen scope and everything below it.'
              : `On ${scopeLabel(data.scopes, scope)}, and everything below it.`}
          </Text>
        </Stack>
        {error !== undefined && <Text size="sm" c="red">{error}</Text>}
      </Stack>
    </Form>
  );
}
