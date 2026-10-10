import { isInside, ROOT_ID } from '../../domain';
import type { Folder, FolderRepository } from '../../domain';
import {
  CURRENT_USER,
  liveFolderIds,
  LOADING_TIME,
  localDateTime,
  SAVE_TIME,
  wait,
  withFavorite,
  withoutDeletedAt,
} from './store';
import type { Store } from './store';

export { createFolderRepository };

function createFolderRepository(store: Store): FolderRepository {
  // A name for a folder in `parentId`: trimmed, not empty, and no sibling outside the trash has it already (ignoring
  // the case).
  const checkedName = (parentId: string | null, name: string, id?: string) => {
    const trimmed = name.trim();
    const live = liveFolderIds(store);

    if (trimmed === '') {
      throw new Error('The name must not be empty.');
    }

    if (/[/\\]/.test(trimmed)) {
      throw new Error('The name must not contain a slash.');
    }

    if (
      store.folders.some((folder) =>
        folder.parentId === parentId && folder.id !== id && live.has(folder.id)
        && folder.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      throw new Error(`There is already a folder "${trimmed}" here.`);
    }

    return trimmed;
  };

  // A storage (or the root) is set up elsewhere: it is refused here.
  const checkNoStorage = (ids: readonly string[], refusal: string) => {
    if (ids.some((id) => id === ROOT_ID || store.folders.find((folder) => folder.id === id)?.storage === true)) {
      throw new Error(refusal);
    }
  };

  return {
    async all(signal) {
      await wait(LOADING_TIME, signal);

      const live = liveFolderIds(store);

      return store.folders.filter((folder) => live.has(folder.id));
    },

    async create(parentId, name) {
      await wait(SAVE_TIME);

      if (parentId === ROOT_ID) {
        throw new Error('"Files" holds only the storages: create the folder in one of them.');
      }

      const folder: Folder = {
        id: store.newId('d'),
        parentId,
        name: checkedName(parentId, name),
        created: localDateTime(new Date()),
        owner: CURRENT_USER,
      };

      store.folders.push(folder);

      return folder;
    },

    async rename(id, name) {
      await wait(SAVE_TIME);

      const folder = store.folders.find((candidate) => candidate.id === id);

      checkNoStorage([id], 'A storage cannot be renamed.');

      if (folder === undefined) {
        throw new Error('The folder does not exist anymore.');
      }

      const renamed = { ...folder, name: checkedName(folder.parentId, name, id) };

      store.folders = store.folders.map((candidate) => (candidate.id === id ? renamed : candidate));

      return renamed;
    },

    async move(ids, parentId) {
      await wait(SAVE_TIME);

      checkNoStorage(ids, 'A storage cannot be moved.');

      if (parentId === ROOT_ID) {
        throw new Error('"Files" holds only the storages: move into one of them.');
      }

      if (ids.some((id) => isInside(store.folders, parentId, id))) {
        throw new Error('A folder cannot be moved into itself or one of its subfolders.');
      }

      for (const id of ids) {
        const folder = store.folders.find((candidate) => candidate.id === id);

        if (folder !== undefined) {
          checkedName(parentId, folder.name, id);
        }
      }

      store.folders = store.folders.map((folder) => (ids.includes(folder.id) ? { ...folder, parentId } : folder));
    },

    // Into the trash (2026-10-08; deleted for good before): only the folder is marked, what is in it goes with it.
    async delete(ids) {
      await wait(SAVE_TIME);

      checkNoStorage(ids, 'A storage cannot be deleted.');

      const deletedAt = localDateTime(new Date());

      store.folders = store.folders.map((folder) => (ids.includes(folder.id) ? { ...folder, deletedAt } : folder));
    },

    async trash(signal) {
      await wait(LOADING_TIME, signal);

      const live = liveFolderIds(store);

      return store.folders.filter((folder) => !live.has(folder.id));
    },

    async restore(ids) {
      await wait(SAVE_TIME);

      const live = liveFolderIds(store);

      for (const id of ids) {
        const folder = store.folders.find((candidate) => candidate.id === id);

        if (folder?.deletedAt === undefined) {
          throw new Error('The folder is not in the trash anymore.');
        }

        if (folder.parentId === null || !live.has(folder.parentId)) {
          const parent = store.folders.find((candidate) => candidate.id === folder.parentId);

          throw new Error(
            `"${folder.name}" cannot be restored: the folder it was in${
              parent === undefined ? '' : `, "${parent.name}",`
            } is in the trash too. Restore that first.`,
          );
        }

        checkedName(folder.parentId, folder.name, id);
      }

      store.folders = store.folders.map((folder) => (ids.includes(folder.id) ? withoutDeletedAt(folder) : folder));
    },

    // With everything inside: its subfolders and their files, also those in the trash on their own.
    async purge(ids) {
      await wait(SAVE_TIME);

      const gone = new Set(
        store.folders.filter((folder) => ids.some((id) => isInside(store.folders, folder.id, id)))
          .map((folder) => folder.id),
      );

      store.folders = store.folders.filter((folder) => !gone.has(folder.id));
      store.files = store.files.filter((file) => !gone.has(file.folderId));
    },

    async setFavorite(ids, favorite) {
      await wait(SAVE_TIME);

      if (ids.includes(ROOT_ID)) {
        throw new Error('"Files" cannot be a favorite.');
      }

      const marked = new Set(ids);

      store.folders = store.folders.map((folder) => (marked.has(folder.id) ? withFavorite(folder, favorite) : folder));
    },
  };
}
