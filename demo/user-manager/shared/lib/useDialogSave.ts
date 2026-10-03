import { useState } from 'react';
import type { FormConfirmResult } from '../../../../packages/overlays/src/main/dialogs/contract/dialog';

export { useDialogSave };

// The confirmation of a form dialog (the overlays' `<Form confirm>`): checks the input (`check`: a message for the
// first problem, else `undefined`), then saves (`save`, which may refuse: its message). A problem is shown (`error`)
// and keeps the dialog open; the dialog's button shows its spinner while saving.
function useDialogSave(check: () => string | undefined, save: () => Promise<void>) {
  const [error, setError] = useState<string>();

  const confirm = async (): Promise<FormConfirmResult> => {
    const problem = check();

    if (problem !== undefined) {
      setError(problem);
      return { ok: false };
    }

    try {
      await save();
      return { ok: true };
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
      return { ok: false };
    }
  };

  return { error, setError, confirm };
}
