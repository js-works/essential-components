import { Stack, Text, Textarea, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';
import type { Group } from '../../../domain';
import { useDialogSave } from '../../../shared/lib/useDialogSave';

export { GroupForm };

type Values = { name: string; description: string };

// A new group, or a group's name and description, as the content of a form dialog. The server refuses a name another
// group has.
function GroupForm({ group, save }: { group?: Group; save: (values: Values) => Promise<void> }): ReactElement {
  const [values, setValues] = useState<Values>({ name: group?.name ?? '', description: group?.description ?? '' });
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
