import { useQueryClient } from '@tanstack/react-query';

import type { FileItem } from '@local/file-upload';
import { createFileUploadComponent } from '@local/file-upload/react';
import { MANTINE_THEME } from '@local/file-upload/themes';
import { useDialogs, useToast } from '@local/overlays/react';

import { createDemoI18n } from '../../../../packages/file-upload/src/demo/i18n.js';
import type { Folder, MediaFile } from '../../domain/index.js';
import { countText } from '../../shared/lib/format.js';
import { MoveForm } from './components/move-form.js';
import { NameForm } from './components/name-form.js';
import { confirmAndRun } from './confirm-and-run.js';
import { useBrowserService } from './context.js';
import { useSetFavoriteFlow } from './entry-flows.js';
import { browserKeys } from './keys.js';
import type { EntryRow } from './service.js';

export {
  useDownloadFlow,
  useMarkFavoritesFlow,
  useMoveEntriesFlow,
  useNewFolderFlow,
  useRenameEntryFlow,
  useTrashEntriesFlow,
  useUploadFilesFlow,
};

// The flows of a folder's contents, one hook per use case: favorites, a new folder, rename, move, into the trash,
// upload, download. Every change refreshes all reads.

const uploadI18n = createDemoI18n();

const MediaUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
  theme: MANTINE_THEME,
});

// Marks or unmarks the selected rows, then says so.
function useMarkFavoritesFlow() {
  const toasts = useToast();
  const setFavorite = useSetFavoriteFlow();

  return async (rows: readonly EntryRow[], favorite: boolean) => {
    await setFavorite(rows, favorite);
    toasts.success(
      `${countText(rows.map((row) => row.name), 'items')} ${favorite ? 'added to' : 'removed from'} favorites`,
    );
  };
}

// "New folder" in the folder: a name in a form dialog, then a toast.
function useNewFolderFlow(folder: Folder) {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async () => {
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

    if (result.canceled || created === undefined) {
      return;
    }

    await changed();
    toasts.success(`Folder "${created.name}" created`);
  };
}

// "Rename" of a folder or a file: the name in a form dialog, then a toast.
function useRenameEntryFlow() {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async (row: EntryRow) => {
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

    if (result.canceled) {
      return;
    }

    await changed();
    toasts.success(`"${renamed}" renamed`);
  };
}

// "Move" of folders and files to another folder (of the tree), in a form dialog, then a toast.
function useMoveEntriesFlow(folder: Folder, folders: readonly Folder[]) {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async (rows: readonly EntryRow[]) => {
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

    if (result.canceled || target === undefined) {
      return;
    }

    const name = folders.find((candidate) => candidate.id === target)?.name ?? '';

    await changed();
    toasts.success(`${countText(rows.map((row) => row.name), 'items')} moved to "${name}"`);
  };
}

// "Delete": into the trash, after a plain confirmation; "Undo" in the toast.
function useTrashEntriesFlow() {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async (rows: readonly EntryRow[]) => {
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

    if (!done) {
      return;
    }

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
  };
}

// The file upload in a form drawer: each file is uploaded (staged) as soon as it is added, "Apply" adds the staged
// files to the folder, "Cancel" discards them. The native validation blocks "Apply" while a file is unfinished or
// failed, and while there is none (`required`).
function useUploadFilesFlow(folder: Folder) {
  const service = useBrowserService();
  const queryClient = useQueryClient();
  const dialogs = useDialogs();
  const toasts = useToast();
  const changed = () => queryClient.invalidateQueries({ queryKey: browserKeys.all });

  return async () => {
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
          upload={({ file, signal, onProgress }) => service.upload(folder.id, file, onProgress, signal)}
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
}

// "Download": not in the demo, a note says so.
function useDownloadFlow() {
  const dialogs = useDialogs();

  return () => {
    void dialogs.warn({
      title: 'Download',
      content: 'Downloading is not available in this demo.\nThere is no real content behind the files.',
    });
  };
}
