import type { TableController } from '@local/data-table/react';
import type { useDialogs, useToast } from '@local/overlays/react';

export { confirmAndRun };
export type { Dialogs, TableContext, Toasts };

// A flow of every page: a critical confirmation that runs its change before it closes. (A form dialog needs no flow:
// its form saves itself, see `forms.tsx`.)

type Dialogs = ReturnType<typeof useDialogs>;

type Toasts = ReturnType<typeof useToast>;

// What the flows of a table's actions need: the page's dialogs and toasts, and the table (to reload it after a change).
// A table adds what else its flows need (`TableContext<MeetingRow> & { navigate: … }`).
type TableContext<Row> = { dialogs: Dialogs; toasts: Toasts; nav: TableController<Row> };

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
