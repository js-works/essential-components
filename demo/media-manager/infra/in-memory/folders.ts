import { isInside, ROOT_ID } from '../../domain';
import type { Folder, FolderRepository } from '../../domain';
import { CURRENT_USER, LOADING_TIME, localDateTime, SAVE_TIME, wait } from './store';
import type { Store } from './store';

export { createFolderRepository };

function createFolderRepository(store: Store): FolderRepository {
  // A name for a folder in `parentId`: trimmed, not empty, and no sibling has it already (ignoring the case).
  const checkedName = (parentId: string | null, name: string, id?: string) => {
    const trimmed = name.trim();

    if (trimmed === '') {
      throw new Error('The name must not be empty.');
    }

    if (/[/\\]/.test(trimmed)) {
      throw new Error('The name must not contain a slash.');
    }

    if (
      store.folders.some((folder) =>
        folder.parentId === parentId && folder.id !== id && folder.name.toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      throw new Error(`There is already a folder "${trimmed}" here.`);
    }

    return trimmed;
  };

  return {
    async all(signal) {
      await wait(LOADING_TIME, signal);

      return [...store.folders];
    },

    async create(parentId, name) {
      await wait(SAVE_TIME);

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

      if (folder === undefined || folder.id === ROOT_ID) {
        throw new Error('This folder cannot be renamed.');
      }

      const renamed = { ...folder, name: checkedName(folder.parentId, name, id) };

      store.folders = store.folders.map((candidate) => (candidate.id === id ? renamed : candidate));

      return renamed;
    },

    async move(ids, parentId) {
      await wait(SAVE_TIME);

      if (ids.some((id) => id === ROOT_ID || isInside(store.folders, parentId, id))) {
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

    async delete(ids) {
      await wait(SAVE_TIME);

      const gone = new Set(
        store.folders.filter((folder) => ids.some((id) => id !== ROOT_ID && isInside(store.folders, folder.id, id)))
          .map((folder) => folder.id),
      );

      store.folders = store.folders.filter((folder) => !gone.has(folder.id));
      store.files = store.files.filter((file) => !gone.has(file.folderId));
    },
  };
}
