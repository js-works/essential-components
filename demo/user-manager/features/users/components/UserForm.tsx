import { NativeSelect, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';
import type { User, UserValues } from '../../../domain';
import { useDialogSave } from '../../../shared/lib/useDialogSave';

export { DEPARTMENTS, UserForm };

const DEPARTMENTS = ['Management', 'Marketing', 'Sales', 'Finance', 'Human Resources', 'IT', 'Legal', 'Operations'];

// A new user, or a user's data, as the content of a form dialog. Name and a valid email are required; the server
// refuses an email another user has.
function UserForm({ user, save }: { user?: User; save: (values: UserValues) => Promise<void> }): ReactElement {
  const [values, setValues] = useState<UserValues>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    title: user?.title ?? '',
    department: user?.department ?? DEPARTMENTS[0] ?? '',
    active: user?.active ?? true,
  });
  const { error, setError, confirm } = useDialogSave(
    () =>
      values.name.trim() === ''
        ? 'Please enter a name.'
        : !/^\S+@\S+\.\S+$/.test(values.email.trim())
        ? 'Please enter a valid email address.'
        : undefined,
    () => save(values),
  );
  const set = <K extends keyof UserValues>(key: K, value: UserValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setError(undefined);
  };

  return (
    <Form confirm={confirm}>
      <Stack gap="sm">
        <TextInput
          label="Name"
          required
          data-autofocus
          autoComplete="off"
          value={values.name}
          onChange={(event) => set('name', event.currentTarget.value)}
        />
        <TextInput
          label="Email"
          required
          type="email"
          autoComplete="off"
          value={values.email}
          onChange={(event) => set('email', event.currentTarget.value)}
        />
        <TextInput
          label="Title"
          autoComplete="off"
          value={values.title}
          onChange={(event) => set('title', event.currentTarget.value)}
        />
        <NativeSelect
          label="Department"
          data={DEPARTMENTS}
          value={values.department}
          onChange={(event) => set('department', event.currentTarget.value)}
        />
        <Switch
          label="Active (may sign in and has access)"
          checked={values.active}
          onChange={(event) => set('active', event.currentTarget.checked)}
        />
        {error !== undefined && <Text size="sm" c="red">{error}</Text>}
      </Stack>
    </Form>
  );
}
