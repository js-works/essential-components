import { ancestorsOf, childrenOf, FILE_KINDS, isInside, ROOT_ID } from '../../domain';
import type {
  FileCriteria,
  FileKind,
  FileRepository,
  FileSortKey,
  Folder,
  FolderRepository,
  MediaFile,
  Page,
  Paging,
  Sort,
} from '../../domain';

export { createBrowserService };
export type { BrowserService, EntryCriteria, EntryRow, Overview, TrashRow, TrashSortKey };

// A row of the folder table: a folder or a file, with what the table shows of it. `key` is unique over both
// (`d:<id>`, `f:<id>`); `size` of a folder is the number of its entries.
type EntryRow =
  | {
    key: string;
    entry: 'folder';
    id: string;
    name: string;
    type: string;
    kind: 'folder';
    size: number;
    modified: string;
    owner: string;
    folder: Folder;
  }
  | {
    key: string;
    entry: 'file';
    id: string;
    name: string;
    type: string;
    kind: FileKind;
    size: number;
    modified: string;
    owner: string;
    file: MediaFile;
  };

// What the table can ask for: the file criteria of the open folder (without the folder itself, that is the argument).
type EntryCriteria = Omit<FileCriteria, 'folderId'>;

// A row of the trash (2026-10-08): a folder or a file deleted on its own (what was in a deleted folder is not a row of
// its own). `from` is the path it was deleted from (and goes back to), `size` of a folder the number of its entries.
type TrashRow = {
  key: string;
  entry: 'folder' | 'file';
  id: string;
  name: string;
  kind: FileKind | 'folder';
  size: number;
  from: string;
  deletedAt: string;
  owner: string;
};

type TrashSortKey = 'name' | 'size' | 'from' | 'deletedAt' | 'owner';

// The feature's service: what the UI calls. Mostly the repositories' own methods; the logic is the folder's contents
// (its subfolders first, then its files, paged together), and the actions on a mix of folders and files.
function createBrowserService(repositories: { folders: FolderRepository; files: FileRepository }) {
  const { folders, files } = repositories;

  // The folders (of the candidates: a folder's subfolders, or the favorites) that match the criteria (a folder has no
  // kind: with kinds asked for, none), sorted by the same key as the files (by name for a key a folder does not have).
  const matchingFolders = (
    candidates: readonly Folder[],
    criteria: EntryCriteria,
    sort: Sort<FileSortKey> | undefined,
  ) => {
    const text = criteria.text?.trim().toLowerCase() ?? '';
    const { from, to } = criteria.modified ?? {};
    const found = candidates.filter((folder) =>
      (text === '' || folder.name.toLowerCase().includes(text))
      && (criteria.kinds === undefined || criteria.kinds.length === 0)
      && (criteria.owners === undefined || criteria.owners.length === 0 || criteria.owners.includes(folder.owner))
      && (from === undefined || folder.created.slice(0, 10) >= from)
      && (to === undefined || folder.created.slice(0, 10) <= to)
    );
    const key = sort?.key === 'modified' ? 'created' : sort?.key === 'owner' ? 'owner' : 'name';
    const factor = sort?.direction === 'desc' ? -1 : 1;

    return found.sort((a, b) => factor * a[key].localeCompare(b[key], 'en', { numeric: true }));
  };

  const folderRow = (folder: Folder, size: number): EntryRow => ({
    key: `d:${folder.id}`,
    entry: 'folder',
    id: folder.id,
    name: folder.name,
    type: 'Folder',
    kind: 'folder',
    size,
    modified: folder.created,
    owner: folder.owner,
    folder,
  });

  const fileRow = (file: MediaFile): EntryRow => ({
    key: `f:${file.id}`,
    entry: 'file',
    id: file.id,
    name: file.name,
    type: file.type,
    kind: file.kind,
    size: file.size,
    modified: file.modified,
    owner: file.owner,
    file,
  });

  // Folders first, then files, one window over both: the folders given (with their number of entries), and the page
  // of the files the criteria find.
  const window = async (
    all: readonly Folder[],
    subfolders: readonly Folder[],
    criteria: FileCriteria,
    sort: Sort<FileSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<EntryRow>> => {
    const shown = subfolders.slice(paging.offset, paging.offset + paging.limit);
    const page = await files.find(
      criteria,
      sort,
      {
        offset: Math.max(0, paging.offset - subfolders.length),
        limit: paging.limit - shown.length,
      },
      signal,
    );
    // The number of entries of each shown folder (its subfolders and files).
    const sizes = await Promise.all(
      shown.map(async (folder) =>
        childrenOf(all, folder.id).length
        + (await files.find({ folderId: folder.id }, undefined, { offset: 0, limit: 0 }, signal)).total
      ),
    );

    return {
      items: [...shown.map((folder, index) => folderRow(folder, sizes[index] ?? 0)), ...page.items.map(fileRow)],
      total: subfolders.length + page.total,
    };
  };

  return {
    // Straight from the repositories.
    folders: folders.all,
    createFolder: folders.create,
    renameFolder: folders.rename,
    owners: files.owners,
    details: files.details,
    upload: files.upload,
    commit: files.commit,
    discard: files.discard,
    renameFile: files.rename,
    // Files of all folders (Recent).
    findFiles: files.find,

    // The contents of a folder: its subfolders first, then its files; one window over both.
    async entries(
      folderId: string,
      criteria: EntryCriteria,
      sort: Sort<FileSortKey> | undefined,
      paging: Paging,
      signal?: AbortSignal,
    ): Promise<Page<EntryRow>> {
      const all = await folders.all(signal);

      return window(
        all,
        matchingFolders(childrenOf(all, folderId), criteria, sort),
        { ...criteria, folderId },
        sort,
        paging,
        signal,
      );
    },

    // The favorites of all folders (the module Favorites): the folders first, then the files; one window over both.
    async favorites(
      criteria: EntryCriteria,
      sort: Sort<FileSortKey> | undefined,
      paging: Paging,
      signal?: AbortSignal,
    ): Promise<Page<EntryRow>> {
      const all = await folders.all(signal);

      return window(
        all,
        matchingFolders(all.filter((folder) => folder.favorite === true), criteria, sort),
        { ...criteria, favorite: true },
        sort,
        paging,
        signal,
      );
    },

    // The trash (2026-10-08): the folders and files deleted on their own, searched by name, sorted (the last deleted
    // first by default), one window. Small, so it is done here at once.
    async trash(
      text: string,
      sort: Sort<TrashSortKey> | undefined,
      paging: Paging,
      signal?: AbortSignal,
    ): Promise<Page<TrashRow>> {
      const [live, trashedFolders, trashedFiles] = await Promise.all([
        folders.all(signal),
        folders.trash(signal),
        files.trash(signal),
      ]);
      const everything = [...live, ...trashedFolders];
      const pathOf = (id: string | null) =>
        id === null ? '' : ancestorsOf(everything, id).slice(1).map((folder) => folder.name).join(' › ');
      const rows: TrashRow[] = [
        ...trashedFolders.flatMap((folder): TrashRow[] =>
          folder.deletedAt === undefined ? [] : [{
            key: `d:${folder.id}`,
            entry: 'folder',
            id: folder.id,
            name: folder.name,
            kind: 'folder',
            size: childrenOf(everything, folder.id).length
              + trashedFiles.filter((file) => file.folderId === folder.id).length,
            from: pathOf(folder.parentId),
            deletedAt: folder.deletedAt,
            owner: folder.owner,
          }]
        ),
        ...trashedFiles.flatMap((file): TrashRow[] =>
          file.deletedAt === undefined ? [] : [{
            key: `f:${file.id}`,
            entry: 'file',
            id: file.id,
            name: file.name,
            kind: file.kind,
            size: file.size,
            from: pathOf(file.folderId),
            deletedAt: file.deletedAt,
            owner: file.owner,
          }]
        ),
      ];
      const search = text.trim().toLowerCase();
      const { key, direction } = sort ?? { key: 'deletedAt', direction: 'desc' };
      const factor = direction === 'asc' ? 1 : -1;
      const found = rows
        .filter((row) => search === '' || row.name.toLowerCase().includes(search))
        .sort((a, b) => {
          const [left, right] = [a[key], b[key]];

          return factor * (typeof left === 'number' && typeof right === 'number'
            ? left - right
            : String(left).localeCompare(String(right), 'en', { numeric: true }));
        });

      return { items: found.slice(paging.offset, paging.offset + paging.limit), total: found.length };
    },

    // Out of the trash, back where they were (refused while that folder is in the trash too).
    async restore(rows: readonly Pick<TrashRow, 'entry' | 'id'>[]): Promise<void> {
      const folderIds = rows.flatMap((row) => (row.entry === 'folder' ? [row.id] : []));
      const fileIds = rows.flatMap((row) => (row.entry === 'file' ? [row.id] : []));

      // The folders first: a file may go back into one of them.
      if (folderIds.length > 0) {
        await folders.restore(folderIds);
      }

      if (fileIds.length > 0) {
        await files.restore(fileIds);
      }
    },

    // Deleted for good, from the trash (a folder with everything in it).
    async purge(rows: readonly Pick<TrashRow, 'entry' | 'id'>[]): Promise<void> {
      const folderIds = rows.flatMap((row) => (row.entry === 'folder' ? [row.id] : []));
      const fileIds = rows.flatMap((row) => (row.entry === 'file' ? [row.id] : []));

      await Promise.all([
        folderIds.length > 0 ? folders.purge(folderIds) : undefined,
        fileIds.length > 0 ? files.purge(fileIds) : undefined,
      ]);
    },

    // Everything in the trash deleted for good.
    async emptyTrash(): Promise<void> {
      const [trashedFolders, trashedFiles] = await Promise.all([folders.trash(), files.trash()]);
      const folderIds = trashedFolders.flatMap((folder) => (folder.deletedAt === undefined ? [] : [folder.id]));
      const fileIds = trashedFiles.flatMap((file) => (file.deletedAt === undefined ? [] : [file.id]));

      await Promise.all([
        folderIds.length > 0 ? folders.purge(folderIds) : undefined,
        fileIds.length > 0 ? files.purge(fileIds) : undefined,
      ]);
    },

    // Marks folders and files as favorites, or unmarks them.
    async setFavorite(rows: readonly Pick<EntryRow, 'entry' | 'id'>[], favorite: boolean): Promise<void> {
      const folderIds = rows.flatMap((row) => (row.entry === 'folder' ? [row.id] : []));
      const fileIds = rows.flatMap((row) => (row.entry === 'file' ? [row.id] : []));

      await Promise.all([
        folderIds.length > 0 ? folders.setFavorite(folderIds, favorite) : undefined,
        fileIds.length > 0 ? files.setFavorite(fileIds, favorite) : undefined,
      ]);
    },

    // Moves folders and files into a folder. A folder cannot go into itself or one of its subfolders.
    async move(rows: readonly EntryRow[], targetId: string): Promise<void> {
      const all = await folders.all();
      const folderIds = rows.flatMap((row) => (row.entry === 'folder' ? [row.id] : []));
      const fileIds = rows.flatMap((row) => (row.entry === 'file' ? [row.id] : []));

      if (folderIds.some((id) => isInside(all, targetId, id))) {
        throw new Error('A folder cannot be moved into itself or one of its subfolders.');
      }

      if (folderIds.length > 0) {
        await folders.move(folderIds, targetId);
      }

      if (fileIds.length > 0) {
        await files.move(fileIds, targetId);
      }
    },

    // Deletes folders (with everything in them) and files.
    async remove(rows: readonly EntryRow[]): Promise<void> {
      const folderIds = rows.flatMap((row) => (row.entry === 'folder' && row.id !== ROOT_ID ? [row.id] : []));
      const fileIds = rows.flatMap((row) => (row.entry === 'file' ? [row.id] : []));

      await Promise.all([
        folderIds.length > 0 ? folders.delete(folderIds) : undefined,
        fileIds.length > 0 ? files.delete(fileIds) : undefined,
      ]);
    },

    // The numbers of the start page, over all files: in all, of the last week, by kind and by storage, and the last
    // modified ones (`RECENT_ON_OVERVIEW`).
    async overview(signal?: AbortSignal): Promise<Overview> {
      const [all, page] = await Promise.all([
        folders.all(signal),
        files.find({}, { key: 'modified', direction: 'desc' }, { offset: 0, limit: Number.MAX_SAFE_INTEGER }, signal),
      ]);
      // `modified` is a local date and time without a zone: `Date` reads it as local time.
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const storages = childrenOf(all, ROOT_ID).filter((folder) => folder.storage === true);
      const sum = (list: readonly MediaFile[]) => list.reduce((total, file) => total + file.size, 0);

      return {
        files: page.total,
        size: sum(page.items),
        folders: all.length - 1 - storages.length,
        storages: storages.length,
        thisWeek: page.items.filter((file) => new Date(file.modified).getTime() >= weekAgo).length,
        byKind: FILE_KINDS
          .map((kind) => {
            const ofKind = page.items.filter((file) => file.kind === kind);

            return { kind, files: ofKind.length, size: sum(ofKind) };
          })
          .filter((entry) => entry.files > 0)
          .sort((a, b) => b.size - a.size),
        byStorage: storages.map((storage) => {
          const inside = page.items.filter((file) => isInside(all, file.folderId, storage.id));

          return { storage, files: inside.length, size: sum(inside) };
        }),
        recent: page.items.slice(0, RECENT_ON_OVERVIEW),
      };
    },
  };
}

// How many of the last modified files the start page shows.
const RECENT_ON_OVERVIEW = 6;

// The numbers of the start page (`overview()`). `folders` without the root and the storages.
type Overview = {
  files: number;
  size: number;
  folders: number;
  storages: number;
  thisWeek: number;
  byKind: readonly { kind: FileKind; files: number; size: number }[];
  byStorage: readonly { storage: Folder; files: number; size: number }[];
  recent: readonly MediaFile[];
};

type BrowserService = ReturnType<typeof createBrowserService>;
