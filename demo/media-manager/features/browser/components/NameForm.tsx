import { TextInput } from '@mantine/core';
import { useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { Form } from '../../../../../packages/overlays/src/main/bindings/react';

export { NameForm };

// The name of a new folder, or the new name of a folder or a file, as the content of a form dialog. "OK" saves it
// (`save`, which may refuse it: its message shows under the field, and the dialog stays open). For a file, the name
// without its extension is selected first, like in a file manager: typing replaces the name and keeps the type.
function NameForm({ label, initial = '', file = false, save }: {
  label: string;
  initial?: string;
  file?: boolean;
  save: (name: string) => Promise<void>;
}): ReactElement {
  const [name, setName] = useState(initial);
  const [error, setError] = useState<string>();
  const focused = useRef(false);

  return (
    <Form
      confirm={async () => {
        if (name.trim() === '') {
          setError('Please enter a name.');
          return { ok: false };
        }

        try {
          await save(name);
          return { ok: true };
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : String(cause));
          return { ok: false };
        }
      }}
    >
      <TextInput
        label={label}
        value={name}
        error={error}
        autoComplete="off"
        data-autofocus
        onChange={(event) => {
          setName(event.currentTarget.value);
          setError(undefined);
        }}
        onFocus={(event) => {
          if (!focused.current) {
            focused.current = true;
            const input = event.currentTarget;
            const dot = file ? input.value.lastIndexOf('.') : -1;

            input.setSelectionRange(0, dot > 0 ? dot : input.value.length);
          }
        }}
      />
    </Form>
  );
}
