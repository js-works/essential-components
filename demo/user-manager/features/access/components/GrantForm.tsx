import { Input, NativeSelect, Stack } from '@mantine/core';
import type { FocusEvent, ReactElement, ReactNode } from 'react';
import { z } from 'zod';
import { binding } from '../../../../../packages/form-validation/src';
import { scopeLabel } from '../../../domain';
import type { AccessData, PrincipalRef, Scope } from '../../../domain';
import { useForm } from '../../../shared/lib/useForm';
import { ScopePicker } from './ScopePicker';

export { GrantForm };

// "Grant access", as the content of a form dialog: who (a user or a group), which role, where (a scope), validated by
// form-validation (2026-10-06; a check of its own before): all three are required. Any of them may be given (e.g. the
// user of the page it is opened on). Native selects: a Mantine select would open outside the modal dialog.
const grantSchema = z.object({
  who: z.string().min(1),
  roleId: z.string().min(1),
  scopeId: z.string().min(1),
});

// The scope tree is controlled: its value from the form, its `onChange` gives the scope's id.
const scopeBinding = binding({ valueProp: 'value' });

function GrantForm({ data, principal, roleId, scopeId, save }: {
  data: AccessData;
  principal?: PrincipalRef;
  roleId?: string;
  scopeId?: string;
  save: (principal: PrincipalRef, roleId: string, scopeId: string) => Promise<void>;
}): ReactElement {
  const { DialogForm, field } = useForm(grantSchema, {
    initial: { who: principal === undefined ? undefined : `${principal.type}:${principal.id}`, roleId, scopeId },
    submit: async (values) => {
      const [type, id = ''] = values.who.split(':') as ['user' | 'group', string];

      await save({ type, id }, values.roleId, values.scopeId);
    },
  });
  const sorted = <T extends { name: string }>(items: readonly T[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <DialogForm>
      <Stack gap="sm">
        <NativeSelect
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
          {...field.who({ label: 'Who' })}
        />
        <NativeSelect
          data={[
            { value: '', label: 'Choose a role…' },
            ...sorted(data.roles).map((candidate) => ({ value: candidate.id, label: candidate.name })),
          ]}
          {...field.roleId({ label: 'Role' })}
        />
        <ScopeField scopes={data.scopes} {...field.scopeId(scopeBinding, { label: 'Where' })} />
      </Stack>
    </DialogForm>
  );
}

// The scope tree as a field of the form: Mantine's wrapper (label, the hint below the tree, the error), so it looks and
// behaves like the other fields (the message's popover follows the focus in the tree).
function ScopeField({ scopes, value, onChange, onBlur, label, error, required, id, ref }: {
  scopes: readonly Scope[];
  // Given by the controlled binding (not in form-validation's type of the field's props).
  value?: string;
  onChange: (id: string) => void;
  onBlur: (event: FocusEvent) => void;
  label: ReactNode;
  error?: ReactNode;
  required?: boolean;
  id: string;
  ref: (element: HTMLDivElement | null) => void;
}): ReactElement {
  const chosen = value === '' || value === undefined ? undefined : value;

  return (
    <Input.Wrapper
      ref={ref}
      id={id}
      label={label}
      error={error}
      required={required}
      description={chosen === undefined
        ? 'The role applies to the chosen scope and everything below it.'
        : `On ${scopeLabel(scopes, chosen)}, and everything below it.`}
      inputWrapperOrder={['label', 'input', 'description', 'error']}
      onBlur={onBlur}
    >
      <ScopePicker scopes={scopes} value={chosen} onChange={onChange} />
    </Input.Wrapper>
  );
}
