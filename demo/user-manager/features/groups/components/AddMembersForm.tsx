import { Checkbox, Paper, ScrollArea, Stack, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { binding } from '../../../../../packages/form-validation/src';
import type { User } from '../../../domain';
import { useForm } from '../../../shared/lib/useForm';

export { AddMembersForm };

// The users to add to a group (those not in it yet), as the content of a form dialog: a filter and a checklist,
// validated by form-validation (2026-10-06; a check of its own before): at least one user. The filter is no field: it
// only hides users (a chosen one stays chosen).
const membersSchema = z.object({
  userIds: z.array(z.string()).min(1, 'Please choose at least one user.'),
});

// The checklist is controlled: its value from the form, its `onChange` gives the chosen ids.
const checklist = binding({ valueProp: 'value' });

function AddMembersForm({ candidates, save }: {
  candidates: readonly User[];
  save: (userIds: readonly string[]) => Promise<void>;
}): ReactElement {
  const [filter, setFilter] = useState('');
  const [count, setCount] = useState(0);
  const { DialogForm, field } = useForm(membersSchema, {
    initial: { userIds: [] },
    submit: ({ userIds }) => save(userIds),
  });
  const needle = filter.trim().toLowerCase();
  const sorted = [...candidates].sort((a, b) => a.name.localeCompare(b.name));
  const shown = (user: User) => needle === '' || `${user.name} ${user.department}`.toLowerCase().includes(needle);

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput
          placeholder="Filter by name or department"
          aria-label="Filter"
          data-autofocus
          value={filter}
          onChange={(event) => setFilter(event.currentTarget.value)}
        />
        <Checkbox.Group
          {...field.userIds(checklist, {
            label: 'Users to add',
            onChange: (value: readonly string[]) => setCount(value.length),
          })}
        >
          <Paper withBorder radius="sm" mt={4}>
            <ScrollArea.Autosize mah={280} p="xs">
              <Stack gap={8}>
                {sorted.map((user) => (
                  <Checkbox
                    key={user.id}
                    value={user.id}
                    label={user.name}
                    description={`${user.title} · ${user.department}`}
                    display={shown(user) ? undefined : 'none'}
                  />
                ))}
                {!sorted.some(shown) && <Text size="sm" c="dimmed">No user matches.</Text>}
              </Stack>
            </ScrollArea.Autosize>
          </Paper>
        </Checkbox.Group>
        <Text size="xs" c="dimmed">{count} chosen</Text>
      </Stack>
    </DialogForm>
  );
}
