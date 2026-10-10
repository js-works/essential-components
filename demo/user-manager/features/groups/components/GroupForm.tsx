import { Stack, Textarea, TextInput } from '@mantine/core';
import type { ReactElement } from 'react';
import { z } from 'zod';
import type { Group } from '../../../domain';
import { useForm } from '../../../shared/lib/useForm';

export { GroupForm };

type Values = { name: string; description: string };

// A new group, or a group's name and description, as the content of a form dialog, validated by form-validation: the
// name is required; the server refuses a name another group has.
const groupSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().default(''),
});

function GroupForm({ group, save }: { group?: Group; save: (values: Values) => Promise<void> }): ReactElement {
  const { DialogForm, field } = useForm(groupSchema, { initial: group, submit: save });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput data-autofocus autoComplete="off" {...field.name({ label: 'Name' })} />
        <Textarea autosize minRows={2} {...field.description({ label: 'Description' })} />
      </Stack>
    </DialogForm>
  );
}
