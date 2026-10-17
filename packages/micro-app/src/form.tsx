import type { i18n as I18nInstance } from 'i18next';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';

import type { I18nAdapter, UseFormOptions } from '@local/form-validation';
import { defineUseForm } from '@local/form-validation';
import { Form } from '@local/overlays/react';

import type { MicroAppFormConfig } from './api/form.js';
import { FieldError } from './field-error.js';

export { defineForm };

// form-validation's texts from the app's i18next instance: its own messages (the namespace `formValidation`, its
// catalogs), and the labels of the app's keys (`labels: '<form>'` of a form), whatever key style the app uses.
function adapterOf(i18n: I18nInstance): I18nAdapter {
  return {
    currentLocale: () => i18n.language,
    resolveText: (namespace, key, params, defaultValue) =>
      String(i18n.t(key, { ns: namespace, ...params, defaultValue } as never)),
    onChange: (listener) => {
      i18n.on('languageChanged', listener);

      return () => i18n.off('languageChanged', listener);
    },
  };
}

function useAdapter(): I18nAdapter {
  const { i18n } = useTranslation();

  return useMemo(() => adapterOf(i18n), [i18n]);
}

// The props of a field with its message as a popover (`FieldError`) in place of the text: Mantine shows its red frame
// and renders the popover in its error element. `true` (invalid without a message yet) stays as it is.
function withFieldError<P>(props: P): P {
  const { error } = props as { error?: unknown };

  return typeof error === 'string' ? { ...props, error: <FieldError message={error} /> } : props;
}

// A micro-app's form hook, made once per app: form-validation's `useForm` (its texts from the app's i18next) plus
// `DialogForm`, the overlays' `<Form>` bound to the form's `requestSubmit` and its changes (closing a changed form
// asks first), as the content of a form dialog (`dialogs.form`). The message of an invalid field is a popover. A
// refusal of the server is the dialog's note: `errorMessage(error)`, else the `Error`'s message.
function defineForm(config: MicroAppFormConfig = {}) {
  const useValidatedForm = defineUseForm({
    i18n: { type: 'hook', useAdapter },
    errorMessage: (error) => config.errorMessage?.(error) ?? (error instanceof Error ? error.message : undefined),
    props: { label: 'label', error: 'error', invalid: 'error' },
  });

  // biome-ignore lint/suspicious/noExplicitAny: form-validation's own constraint for a schema.
  return function useForm<S extends z.ZodObject<any>>(schema: S, options: UseFormOptions<S>) {
    const form = useValidatedForm(schema, options);
    const { requestSubmit, isDirty } = form;
    // A stable component (`requestSubmit` and `isDirty` are stable): a new one per render would remount the inputs and
    // lose the focus.
    const DialogForm = useMemo(
      () => ({ children }: { children?: ReactNode }) => <Form confirm={requestSubmit} dirty={isDirty}>{children}</Form>,
      [requestSubmit, isDirty],
    );
    // Every field function of the form, its props passed through `withFieldError`.
    const field = new Proxy(form.field, {
      get: (target, key, receiver) => {
        const value: unknown = Reflect.get(target, key, receiver);

        return typeof value === 'function'
          ? (...args: unknown[]) => withFieldError((value as (...rest: unknown[]) => unknown)(...args))
          : value;
      },
    });

    return { ...form, field, DialogForm };
  };
}
