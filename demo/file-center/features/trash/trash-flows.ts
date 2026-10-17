import { useQueryClient } from '@tanstack/react-query';

import { useDialogs, useToast } from '@local/overlays/react';

import { countText } from '../../shared/lib/format.js';
import type { TrashRow } from '../browser/index.js';
import { browserKeys, confirmAndRun, useBrowserService } from '../browser/index.js';

export { useEmptyTrashFlow, usePurgeFlow, useRestoreFlow };

// The flows of the trash, one hook per use case: each gives the function a button or an action calls. A flow
// changes the data and says so; the tables follow the data themselves (the queries).

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

// "Restore" of items of the trash, where they were; then a toast (or the error).
function useRestoreFlow() {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async (rows: readonly TrashRow[]) => {
    try {
      await service.restore(rows);
    } catch (error) {
      toasts.error(errorText(error));
      return;
    }

    await changed();
    toasts.success(`${countText(rows.map((row) => row.name), 'items')} restored`);
  };
}

// "Delete permanently" of items of the trash: a critical confirmation, then a toast.
function usePurgeFlow() {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async (rows: readonly TrashRow[]) => {
    const [first] = rows;
    const done = await confirmAndRun(
      dialogs,
      {
        title: 'Delete permanently',
        content: `${
          rows.length === 1 && first !== undefined
            ? `Delete "${first.name}" permanently?`
            : `Delete the ${rows.length} selected items permanently?`
        }${
          rows.some((row) => row.entry === 'folder') ? '\nFolders go with everything in them.' : ''
        }\nThis cannot be undone.`,
        buttons: { confirm: 'Delete' },
      },
      () => service.purge(rows),
    );

    if (!done) {
      return;
    }

    await changed();
    toasts.success(`${countText(rows.map((row) => row.name), 'items')} deleted permanently`);
  };
}

// "Empty trash": a critical confirmation, then a toast.
function useEmptyTrashFlow() {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async () => {
    const done = await confirmAndRun(
      dialogs,
      {
        title: 'Empty trash',
        content: 'Delete everything in the trash permanently?\nThis cannot be undone.',
        buttons: { confirm: 'Empty trash' },
      },
      () => service.emptyTrash(),
    );

    if (!done) {
      return;
    }

    await changed();
    toasts.success('Trash emptied');
  };
}
