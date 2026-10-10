import type { useDialogs } from '../../../../packages/overlays/src/main/bindings/react';

export { confirmAndRun };

type Dialogs = ReturnType<typeof useDialogs>;

// A confirmation in a scope: it stays open while `run` changes the data, and closes when that is done. Critical by
// default (a danger button, no confirm on Enter); a plain one for what can be undone (moving into the trash).
// Resolves `true` when confirmed and done.
async function confirmAndRun(
  dialogs: Dialogs,
  config: Parameters<Dialogs['confirmCritical']>[0],
  run: () => Promise<void>,
  { critical = true }: { critical?: boolean } = {},
): Promise<boolean> {
  const scope = dialogs.open();

  try {
    if ((await (critical ? scope.confirmCritical(config) : scope.confirm(config))).canceled) {
      return false;
    }

    await run();

    return true;
  } finally {
    scope.dispose();
  }
}
