import { Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';
import { useDialogSave } from '../../../shared/lib/useDialogSave';

export { RoleForm };

type Values = { name: string; description: string };

// A role's name and description, as the content of a form dialog (its permissions are edited on its page). The server
// refuses a name another role has.
function RoleForm({ initial, save }: { initial?: Values; save: (values: Values) => Promise<void> }): ReactElement {
  const [values, setValues] = useState<Values>(initial ?? { name: '', description: '' });
  const { error, setError, confirm } = useDialogSave(
    () => (values.name.trim() === '' ? 'Please enter a name.' : undefined),
    () => save(values),
  );

  return (
    <Form confirm={confirm}>
      <Stack gap="sm">
        <TextInput
          label="Name"
          required
          data-autofocus
          autoComplete="off"
          value={values.name}
          onChange={(event) => {
            const name = event.currentTarget.value;

            setValues((current) => ({ ...current, name }));
            setError(undefined);
          }}
        />
        <Textarea
          label="Description"
          autosize
          minRows={2}
          value={values.description}
          onChange={(event) => {
            const description = event.currentTarget.value;

            setValues((current) => ({ ...current, description }));
          }}
        />
        {error !== undefined && <Text size="sm" c="red">{error}</Text>}
      </Stack>
    </Form>
  );
}
