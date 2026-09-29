import type { useDialogs } from '../../packages/overlays/src/main/bindings/react';
import type { FormValidator } from '../../packages/overlays/src/main/dialogs/contract/dialog';
import type { FormDialogData } from '../../packages/overlays/src/main/dialogs/contract/form-data';

export { confirmAndRun, submitForm };
export type { Dialogs, FormCheck };

// The two flows of every page: a form dialog that saves before it closes, and a critical confirmation that runs its
// change before it closes.

type Dialogs = ReturnType<typeof useDialogs>;

type FormConfig = Parameters<Dialogs['form']>[0];

// How the form of a dialog is validated: Mantine's validation (`@mantine/form`), not the browser's. The form in the
// content registers its `validate` (`useCheck`), and the dialog asks it before "OK". Until then, everything is valid.
type FormCheck = FormValidator & { set(validate: () => boolean): void };

// The dialog stays open while `submit` saves (its button shows a spinner); a failed save keeps it open with the values
// and a note. Resolves `true` when saved, `false` when canceled. The content gets the check of the dialog's form.
async function submitForm(
  dialogs: Dialogs,
  config: Omit<FormConfig, 'content'> & { content: (check: FormCheck) => FormConfig['content'] },
  submit: (data: FormDialogData) => Promise<void>,
): Promise<boolean> {
  let validate = () => true;
  const check: FormCheck = { set: (next) => void (validate = next), validate: () => validate() };
  const form = dialogs.form({ ...config, content: config.content(check), nativeValidation: false, validator: check });

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
