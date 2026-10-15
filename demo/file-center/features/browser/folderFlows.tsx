import type { FileItem, FileUploadTheme } from '@local/file-upload';
import { createFileUploadComponent } from '@local/file-upload/react';
import { useDialogs, useToast } from '@local/overlays/react';
import { useQueryClient } from '@tanstack/react-query';
import { createDemoI18n } from '../../../../packages/file-upload/demo/i18n.js';
import type { Folder, MediaFile } from '../../domain/index.js';
import { countText } from '../../shared/lib/format.js';
import { MoveForm } from './components/MoveForm.js';
import { NameForm } from './components/NameForm.js';
import { confirmAndRun } from './confirmAndRun.js';
import { useBrowserService } from './context.js';
import { browserKeys } from './keys.js';
import type { EntryRow } from './service.js';
import { useEntryActions } from './useEntryActions.js';

export { useFolderFlows };
export type { FolderFlows };

const uploadI18n = createDemoI18n();

// The file upload in Mantine's look: its theme values are Mantine's variables (inherited into its shadow DOM from the
// scope), like the data table's `mantineTheme`.
const MANTINE_UPLOAD_THEME: FileUploadTheme = {
  accentColor: 'var(--mantine-primary-color-filled)',
  accentTextColor: 'var(--mantine-primary-color-contrast)',
  textColor: 'var(--mantine-color-text)',
  mutedColor: 'var(--mantine-color-dimmed)',
  borderColor: 'var(--mantine-color-default-border)',
  surfaceColor: 'var(--mantine-color-default-hover)',
  successColor: 'var(--mantine-color-green-text)',
  dangerColor: 'var(--mantine-color-error)',
  borderRadius: 'var(--mantine-radius-default)',
  buttonBorderRadius: 'var(--mantine-radius-default)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
};

const MediaUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
  theme: MANTINE_UPLOAD_THEME,
});

// What `useFolderFlows()` gives: the flows, for the functions that build a table's actions.
type FolderFlows = ReturnType<typeof useFolderFlows>;

// The changes in a folder: favorites, a new folder, rename, move, into the trash (with "Undo"), upload; download (not
// in the demo). Every change refreshes all reads.
function useFolderFlows(folder: Folder, folders: readonly Folder[]) {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const { setFavorite } = useEntryActions(folders);
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  // Marks or unmarks the selected rows, then says so.
  const favorites = async (rows: readonly EntryRow[], favorite: boolean) => {
    await setFavorite(rows, favorite);
    toasts.success(
      `${countText(rows.map((row) => row.name), 'items')} ${favorite ? 'added to' : 'removed from'} favorites`,
    );
  };

  const newFolder = async () => {
    let created: Folder | undefined;
    const result = await dialogs.form({
      title: 'New folder',
      content: (
        <NameForm
          label="Name"
          save={async (name) => {
            created = await service.createFolder(folder.id, name);
          }}
        />
      ),
      buttons: { confirm: 'Create' },
    });

    if (!result.canceled && created !== undefined) {
      await changed();
      toasts.success(`Folder "${created.name}" created`);
    }
  };

  const rename = async (row: EntryRow) => {
    let renamed = row.name;
    const result = await dialogs.form({
      title: row.entry === 'folder' ? 'Rename folder' : 'Rename file',
      content: (
        <NameForm
          label="Name"
          initial={row.name}
          file={row.entry === 'file'}
          save={async (name) => {
            renamed = row.entry === 'folder'
              ? (await service.renameFolder(row.id, name)).name
              : (await service.renameFile(row.id, name)).name;
          }}
        />
      ),
      buttons: { confirm: 'Save' },
    });

    if (!result.canceled) {
      await changed();
      toasts.success(`"${renamed}" renamed`);
    }
  };

  const move = async (rows: readonly EntryRow[]) => {
    let target: string | undefined;
    const result = await dialogs.form({
      title: rows.length === 1 ? `Move "${rows[0]?.name ?? ''}"` : `Move ${rows.length} items`,
      content: (
        <MoveForm
          folders={folders}
          current={folder.id}
          moving={rows.flatMap((row) => (row.entry === 'folder' ? [row.id] : []))}
          save={async (targetId) => {
            await service.move(rows, targetId);
            target = targetId;
          }}
        />
      ),
      buttons: { confirm: 'Move' },
    });

    if (!result.canceled && target !== undefined) {
      const name = folders.find((candidate) => candidate.id === target)?.name ?? '';

      await changed();
      toasts.success(`${countText(rows.map((row) => row.name), 'items')} moved to "${name}"`);
    }
  };

  // Into the trash (2026-10-08; deleted for good before): a plain confirmation, and "Undo" in the toast.
  const remove = async (rows: readonly EntryRow[]) => {
    const [first] = rows;
    const withFolders = rows.some((row) => row.entry === 'folder');
    const done = await confirmAndRun(
      dialogs,
      {
        title: 'Move to trash',
        content: `${
          rows.length === 1 && first !== undefined
            ? `Move "${first.name}" to the trash?`
            : `Move the ${rows.length} selected items to the trash?`
        }${withFolders ? '\nFolders go with everything in them.' : ''}\nThey can be restored from the trash.`,
        buttons: { confirm: 'Move to trash' },
      },
      () => service.remove(rows),
      { critical: false },
    );

    if (done) {
      await changed();
      toasts.success({
        message: `${countText(rows.map((row) => row.name), 'items')} moved to the trash`,
        actions: [{
          label: 'Undo',
          onClick: async () => {
            try {
              await service.restore(rows);
              await changed();
            } catch (error) {
              toasts.error(error instanceof Error ? error.message : String(error));
            }
          },
        }],
      });
    }
  };

  // The file upload in a form drawer: each file is uploaded (staged) as soon as it is added, "Apply" adds the staged
  // files to the folder, "Cancel" discards them. The native validation blocks "Apply" while a file is unfinished or
  // failed, and while there is none (`required`).
  const upload = async () => {
    let items: readonly FileItem[] = [];
    let committed: readonly MediaFile[] = [];
    const drawer = dialogs.form({
      surface: 'drawer',
      title: `Upload to "${folder.name}"`,
      content: (
        <MediaUpload
          name="files"
          multiple
          previews
          required
          upload={(file, { signal, onProgress }) => service.upload(folder.id, file, onProgress, signal)}
          onChange={(next) => {
            items = next;
          }}
        />
      ),
      buttons: { confirm: 'Apply' },
    });

    for await (const attempt of drawer) {
      committed = await service.commit(attempt.data.strings('files'));
      attempt.accept();
    }

    if ((await drawer).canceled) {
      service.discard(items.flatMap((item) => (item.result === undefined ? [] : [item.result])));
      return;
    }

    await changed();
    toasts.success(`${countText(committed.map((file) => file.name), 'files')} uploaded`);
  };

  const download = () => {
    void dialogs.warn({
      title: 'Download',
      content: 'Downloading is not available in this demo.\nThere is no real content behind the files.',
    });
  };

  return { favorites, newFolder, rename, move, remove, upload, download };
}
