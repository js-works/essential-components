import type { FormDialogData } from '../../packages/overlays/src/main/dialogs/contract/form-data';
import type { useDialogs } from '../../packages/overlays/src/main/bindings/react';

export { confirmAndRun, submitForm };
export type { Dialogs };

// The two flows of every page: a form dialog that saves before it closes, and a critical confirmation that runs its
// change before it closes.

type Dialogs = ReturnType<typeof useDialogs>;

// The dialog stays open while `submit` saves (its button shows a spinner); a failed save keeps it open with the values
// and a note. Resolves `true` when saved, `false` when canceled.
async function submitForm(
  dialogs: Dialogs,
  config: Parameters<Dialogs['form']>[0],
  submit: (data: FormDialogData) => Promise<void>,
): Promise<boolean> {
  const form = dialogs.form(config);

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
