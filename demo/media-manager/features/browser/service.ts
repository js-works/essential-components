import { childrenOf, isInside, ROOT_ID } from '../../domain';
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
export type { BrowserService, EntryCriteria, EntryRow };

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

// The feature's service: what the UI calls. Mostly the repositories' own methods; the logic is the folder's contents
// (its subfolders first, then its files, paged together), and the actions on a mix of folders and files.
function createBrowserService(repositories: { folders: FolderRepository; files: FileRepository }) {
  const { folders, files } = repositories;

  // The subfolders of a folder that match the criteria (a folder has no kind: with kinds asked for, none), sorted by
  // the same key as the files (by name for a key a folder does not have).
  const matchingFolders = (
    all: readonly Folder[],
    folderId: string,
    criteria: EntryCriteria,
    sort: Sort<FileSortKey> | undefined,
  ) => {
    const text = criteria.text?.trim().toLowerCase() ?? '';
    const { from, to } = criteria.modified ?? {};
    const found = childrenOf(all, folderId).filter((folder) =>
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

    // The contents of a folder: its subfolders first, then its files; one window over both.
    async entries(
      folderId: string,
      criteria: EntryCriteria,
      sort: Sort<FileSortKey> | undefined,
      paging: Paging,
      signal?: AbortSignal,
    ): Promise<Page<EntryRow>> {
      const all = await folders.all(signal);
      const subfolders = matchingFolders(all, folderId, criteria, sort);
      const shown = subfolders.slice(paging.offset, paging.offset + paging.limit);
      const page = await files.find(
        { ...criteria, folderId },
        sort,
        {
          offset: Math.max(0, paging.offset - subfolders.length),
          limit: paging.limit - shown.length,
        },
        signal,
      );
      // The number of entries of each shown subfolder (its subfolders and files).
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
  };
}

type BrowserService = ReturnType<typeof createBrowserService>;
