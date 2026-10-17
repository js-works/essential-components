import { useDialogs, useToast } from '@local/overlays/react';

import { useTranslate } from './i18n/index.js';

export { useFlowKit };

// What every flow needs: the dialogs, the toasts, `t`, and the two shapes most flows have, `formFlow` and
// `confirmFlow`. Both resolve `true` when done (saved, confirmed and changed), `false` when canceled.

type Dialogs = ReturnType<typeof useDialogs>;

// The toast's text after it is done: a function when it depends on what was saved (read after the save).
type Success = string | (() => string);

type FormFlowConfig = Parameters<Dialogs['form']>[0] & { success: Success };

type ConfirmFlowConfig = Parameters<Dialogs['confirm']>[0] & {
  // A danger button, no confirm on Enter: for a change that loses something (a delete).
  critical?: boolean;
  run: () => Promise<unknown>;
  success: Success;
};

function useFlowKit() {
  const dialogs = useDialogs();
  const toasts = useToast();
  const t = useTranslate();

  function toast(success: Success): void {
    toasts.success(typeof success === 'string' ? success : success());
  }

  // A form dialog (its form saves itself before it closes, see `forms.tsx`), then the toast.
  async function formFlow({ success, ...config }: FormFlowConfig): Promise<boolean> {
    const result = await dialogs.form(config);

    if (result.canceled) {
      return false;
    }

    toast(success);

    return true;
  }

  // A confirmation in a scope: it stays open after its button while `run` changes the data, and closes when that is
  // done; then the toast.
  async function confirmFlow({ critical = false, run, success, ...config }: ConfirmFlowConfig): Promise<boolean> {
    {
      using scope = dialogs.open();
      const result = await (critical ? scope.confirmCritical(config) : scope.confirm(config));

      if (result.canceled) {
        return false;
      }

      await run();
    }

    toast(success);

    return true;
  }

  return { dialogs, toasts, t, formFlow, confirmFlow };
}
