import { Stack, Textarea, TextInput } from '@mantine/core';
import { z } from 'zod';
import { useForm } from '../../../shared/lib/use-form.js';

export { RoleForm };

type Values = { name: string; description: string };

// A role's name and description, as the content of a form dialog (its permissions are edited on its page), validated by
// form-validation: the name is required; the server refuses a name another role has.
const roleSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().default(''),
});

function RoleForm({ initial, save }: { initial?: Values; save: (values: Values) => Promise<void> }) {
  const { DialogForm, field } = useForm(roleSchema, { initial, submit: save });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput data-autofocus autoComplete="off" {...field.name({ label: 'Name' })} />
        <Textarea autosize minRows={2} {...field.description({ label: 'Description' })} />
      </Stack>
    </DialogForm>
  );
}
