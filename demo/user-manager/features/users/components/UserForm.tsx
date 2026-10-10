import { NativeSelect, Stack, Switch, TextInput } from '@mantine/core';
import type { ReactElement } from 'react';
import { z } from 'zod';
import type { User, UserValues } from '../../../domain';
import { useForm } from '../../../shared/lib/useForm';

export { DEPARTMENTS, UserForm };

const DEPARTMENTS = ['Management', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'IT', 'Legal', 'Operations'];

// A new user, or a user's data, as the content of a form dialog, validated by form-validation (2026-10-06; a check of
// its own before): the name is required, the email required and valid; the server refuses an email another user has.
const userSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  title: z.string().trim().default(''),
  department: z.string().min(1),
  active: z.boolean().default(true),
});

function UserForm({ user, save }: { user?: User; save: (values: UserValues) => Promise<void> }): ReactElement {
  const { DialogForm, field } = useForm(userSchema, {
    initial: user ?? { department: DEPARTMENTS[0], active: true },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput data-autofocus autoComplete="off" {...field.name({ label: 'Name' })} />
        <TextInput type="email" autoComplete="off" {...field.email({ label: 'Email' })} />
        <TextInput autoComplete="off" {...field.title({ label: 'Title' })} />
        <NativeSelect data={DEPARTMENTS} {...field.department({ label: 'Department' })} />
        <Switch {...field.active({ label: 'Active (may sign in and has access)' })} />
      </Stack>
    </DialogForm>
  );
}
