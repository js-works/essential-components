import { useMemo } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { z } from 'zod';
import { defineUseForm } from '../../../../packages/form-validation/src';
import type { UseFormOptions } from '../../../../packages/form-validation/src';
import { Form } from '../../../../packages/overlays/src/main/bindings/react';
import { AppError } from '../../infra/in-memory';
import { i18nAdapter, translateKey } from './i18n';

export { useForm };

// The app's form hook: form-validation's `useForm` (`defineUseForm`, configured once here) plus `DialogForm`, the
// overlays' `<Form>` bound to the form's `requestSubmit`, as the content of a form dialog (`dialogs.form`).
const useValidatedForm = defineUseForm({
  i18n: { type: 'hook', useAdapter: () => i18nAdapter },
  // The fake server's errors are meant for the user (an `AppError`: a key and its values, translated here).
  errorMessage: (error) =>
    error instanceof AppError
      ? translateKey(`errors.${error.key}`, error.params)
      : error instanceof Error
      ? error.message
      : undefined,
  props: { label: 'label', error: 'error', invalid: 'error' },
});

function useForm<S extends z.ZodObject<any>>(schema: S, options: UseFormOptions<S>) {
  const form = useValidatedForm(schema, options);
  const { requestSubmit } = form;
  // A stable component (`requestSubmit` is stable): a new one per render would remount the inputs and lose the focus.
  const DialogForm = useMemo(
    () => ({ children }: { children?: ReactNode }): ReactElement => <Form confirm={requestSubmit}>{children}</Form>,
    [requestSubmit],
  );

  return { ...form, DialogForm };
}
