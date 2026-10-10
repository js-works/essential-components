import { useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { z } from 'zod';
import { defineUseForm } from '../../../../packages/form-validation/src';
import type { I18nAdapter, UseFormOptions } from '../../../../packages/form-validation/src';
import { Form } from '../../../../packages/overlays/src/main/bindings/react';
import { FieldError } from '../ui/FieldError';

export { useForm };

// The app's form hook, like the Board Manager's and the Time Tracker's (2026-10-06): form-validation's `useForm`
// (`defineUseForm`, configured once here) plus `DialogForm`, the overlays' `<Form>` bound to the form's
// `requestSubmit`, as the content of a form dialog (`dialogs.form`). The message of an invalid field is a popover
// (`FieldError`). A refusal of the server (its `Error`'s message) is the dialog's note.
//
// The app is English only: its adapter keeps form-validation's messages English whatever `<html lang>` says, and gives
// every text the library's own (the labels are given by the forms: `field.name({ label: 'Name' })`).
const english: I18nAdapter = {
  currentLocale: () => 'en-US',
  resolveText: (_namespace, _key, _params, defaultValue) => defaultValue,
};

const useValidatedForm = defineUseForm({
  i18n: { type: 'hook', useAdapter: () => english },
  errorMessage: (error) => (error instanceof Error ? error.message : undefined),
  props: { label: 'label', error: 'error', invalid: 'error' },
});

// The props of a field with its message as a popover (`FieldError`) in place of the text: Mantine shows its red frame
// and renders the popover in its error element. `true` (invalid without a message yet) stays as it is.
function withFieldError<P>(props: P): P {
  const { error } = props as { error?: unknown };

  return typeof error === 'string' ? { ...props, error: <FieldError message={error} /> } : props;
}

function useForm<S extends z.ZodObject<any>>(schema: S, options: UseFormOptions<S>) {
  const form = useValidatedForm(schema, options);
  const { requestSubmit, isDirty } = form;
  // A stable component (`requestSubmit` and `isDirty` are stable): a new one per render would remount the inputs and
  // lose the focus. With `dirty`, closing the dialog after a change asks first ("Discard your changes?").
  const DialogForm = useMemo(
    () => ({ children }: { children?: ReactNode }): ReactElement => (
      <Form confirm={requestSubmit} dirty={isDirty}>{children}</Form>
    ),
    [requestSubmit, isDirty],
  );
  // Every field function of the form, its props passed through `withFieldError` (the forms are flat).
  const field = new Proxy(form.field, {
    get: (target, key, receiver) => {
      const value: unknown = Reflect.get(target, key, receiver);

      return typeof value === 'function'
        ? (...args: unknown[]) => withFieldError((value as (...rest: unknown[]) => unknown)(...args))
        : value;
    },
  });

  return { ...form, field, DialogForm };
}
