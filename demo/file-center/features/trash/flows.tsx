import { useDialogs, useToast } from '@local/overlays/react';
import { useQueryClient } from '@tanstack/react-query';
import { countText } from '../../shared/lib/format.js';
import { browserKeys, confirmAndRun, useBrowserService } from '../browser/index.js';
import type { TrashRow } from '../browser/index.js';

export { useTrashFlows };
export type { TrashFlows };

// What `useTrashFlows()` gives: the flows, for the functions that build a table's actions.
type TrashFlows = ReturnType<typeof useTrashFlows>;

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

// The changes of the trash: restore, delete permanently (a critical confirmation), empty it.
function useTrashFlows() {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  const restore = async (rows: readonly TrashRow[]) => {
    try {
      await service.restore(rows);
    } catch (error) {
      toasts.error(errorText(error));
      return;
    }

    await changed();
    toasts.success(`${countText(rows.map((row) => row.name), 'items')} restored`);
  };

  const purge = async (rows: readonly TrashRow[]) => {
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

    if (done) {
      await changed();
      toasts.success(`${countText(rows.map((row) => row.name), 'items')} deleted permanently`);
    }
  };

  const empty = async () => {
    const done = await confirmAndRun(
      dialogs,
      {
        title: 'Empty trash',
        content: 'Delete everything in the trash permanently?\nThis cannot be undone.',
        buttons: { confirm: 'Empty trash' },
      },
      () => service.emptyTrash(),
    );

    if (done) {
      await changed();
      toasts.success('Trash emptied');
    }
  };

  return { restore, purge, empty };
}
