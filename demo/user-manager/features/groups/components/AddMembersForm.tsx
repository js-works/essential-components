import { Checkbox, Paper, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';
import type { User } from '../../../domain';
import { useDialogSave } from '../../../shared/lib/useDialogSave';

export { AddMembersForm };

// The users to add to a group (those not in it yet), as the content of a form dialog: a filter and a checklist.
function AddMembersForm({ candidates, save }: {
  candidates: readonly User[];
  save: (userIds: readonly string[]) => Promise<void>;
}): ReactElement {
  const [filter, setFilter] = useState('');
  const [chosen, setChosen] = useState<readonly string[]>([]);
  const { error, setError, confirm } = useDialogSave(
    () => (chosen.length === 0 ? 'Please choose at least one user.' : undefined),
    () => save(chosen),
  );
  const needle = filter.trim().toLowerCase();
  const shown = [...candidates]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((user) => needle === '' || `${user.name} ${user.department}`.toLowerCase().includes(needle));

  return (
    <Form confirm={confirm}>
      <Stack gap="sm">
        <TextInput
          placeholder="Filter by name or department"
          data-autofocus
          value={filter}
          onChange={(event) => setFilter(event.currentTarget.value)}
        />
        <Paper withBorder radius="sm">
          <ScrollArea.Autosize mah={280} p="xs">
            <Checkbox.Group
              value={[...chosen]}
              onChange={(value) => {
                setChosen(value);
                setError(undefined);
              }}
            >
              <Stack gap={8}>
                {shown.map((user) => (
                  <Checkbox
                    key={user.id}
                    value={user.id}
                    label={user.name}
                    description={`${user.title} · ${user.department}`}
                  />
                ))}
                {shown.length === 0 && <Text size="sm" c="dimmed">No user matches.</Text>}
              </Stack>
            </Checkbox.Group>
          </ScrollArea.Autosize>
        </Paper>
        <Text size="xs" c="dimmed">{chosen.length} chosen</Text>
        {error !== undefined && <Text size="sm" c="red">{error}</Text>}
      </Stack>
    </Form>
  );
}
