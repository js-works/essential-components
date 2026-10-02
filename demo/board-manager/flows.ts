import { createContext, createElement, useContext, useEffect } from 'react';
import type { useDialogs } from '../../packages/overlays/src/main/bindings/react';
import type { FormValidator } from '../../packages/overlays/src/main/dialogs/contract/dialog';
import type { FormDialogData } from '../../packages/overlays/src/main/dialogs/contract/form-data';

export { confirmAndRun, submitForm, useDialogValidator };
export type { Dialogs };

// The two flows of every page: a form dialog that saves before it closes, and a critical confirmation that runs its
// change before it closes.

type Dialogs = ReturnType<typeof useDialogs>;

type FormConfig = Parameters<Dialogs['form']>[0];

// How the form of a dialog is validated: by form-validation, not the browser. The dialog's validator is a check whose
// validation the form in the content registers (`useDialogValidator`, through a context around the content); the
// dialog asks it before "OK", with its `<form>`. Until then, everything is valid.
type FormCheck = FormValidator & { set(validate: (form: HTMLFormElement) => boolean): void };

const DialogCheck = createContext<FormCheck | null>(null);

// Registers a form's validation with the dialog it is in (on every render, the latest); nothing outside a form dialog.
// form-validation calls it in every form (its `useValidator`).
function useDialogValidator(validate: (form: HTMLFormElement) => boolean): void {
  const check = useContext(DialogCheck);

  useEffect(() => check?.set(validate));
}

// The dialog stays open while `submit` saves (its button shows a spinner); a failed save keeps it open with the values
// and a note. Resolves `true` when saved, `false` when canceled.
async function submitForm(
  dialogs: Dialogs,
  config: FormConfig,
  submit: (data: FormDialogData) => Promise<void>,
): Promise<boolean> {
  let validate = (_form: HTMLFormElement) => true;
  const check: FormCheck = { set: (next) => void (validate = next), validate: (form) => validate(form) };
  const content = createElement(DialogCheck, { value: check }, config.content);
  const form = dialogs.form({ ...config, content, nativeValidation: false, validator: check });

  for await (const attempt of form) {
    try {
      await submit(attempt.data);
      attempt.accept();
    } catch (error) {
      attempt.reject(error instanceof Error ? error.message : String(error), 'Not saved');
    }
  }

  return !(await form).canceled;
}

// A critical confirmation (a danger button, no confirm on Enter) in a scope: it stays open after its button while `run`
// changes the data, and closes when that is done. Resolves `true` when confirmed and done.
async function confirmAndRun(
  dialogs: Dialogs,
  config: Parameters<Dialogs['confirmCritical']>[0],
  run: () => Promise<void>,
): Promise<boolean> {
  const scope = dialogs.open();

  try {
    const result = await scope.confirmCritical(config);

    if (result.canceled) {
      return false;
    }

    await run();

    return true;
  } finally {
    scope.dispose();
  }
}
