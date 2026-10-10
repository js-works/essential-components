export { ancestorsOf, childrenOf, isInside, ROOT_ID };
export type { Folder, FolderRepository };

// A folder of the media library. The root is a folder too (`ROOT_ID`, without a parent): "Files" (2026-10-08, the
// module's name; "Media" before, "All files" before 2026-10-07).
type Folder = {
  id: string;
  // `null` only for the root.
  parentId: string | null;
  name: string;
  // An ISO date and time.
  created: string;
  owner: string;
  // A storage (2026-10-07): where files are kept (a share, a bucket, a disk; the app does not know what is behind it),
  // like a mount point. The root holds only storages, and a storage is always directly in the root. Storages are set
  // up elsewhere: one cannot be created, renamed, moved or deleted here.
  storage?: true;
  // Marked as a favorite (2026-10-08): the module Favorites lists it. Not the root.
  favorite?: true;
  // In the trash since then (2026-10-08; a local date and time), with everything in it; its `parentId` is where it
  // was deleted from, and where a restore puts it back.
  deletedAt?: string;
};

const ROOT_ID = 'root';

// The folders, independent of where they are kept. Folders are few, so they are read all at once (the tree).
// Everything but `trash()` sees only the folders outside the trash (neither in it nor inside one that is).
interface FolderRepository {
  all(signal?: AbortSignal): Promise<readonly Folder[]>;
  // The name is trimmed; an empty one, or one a sibling has already (ignoring the case), is refused. Not in the root.
  create(parentId: string, name: string): Promise<Folder>;
  // Not a storage.
  rename(id: string, name: string): Promise<Folder>;
  // Into another folder (not the root); never into itself or one of its own subfolders. Not a storage.
  move(ids: readonly string[], parentId: string): Promise<void>;
  // Into the trash, with everything in it: its subfolders and their files. Not a storage.
  delete(ids: readonly string[]): Promise<void>;
  // The folders in the trash, and those inside them.
  trash(signal?: AbortSignal): Promise<readonly Folder[]>;
  // Out of the trash, back where they were. Refused while that folder is in the trash itself, or when a folder there
  // has the name now.
  restore(ids: readonly string[]): Promise<void>;
  // Deleted for good (only from the trash), with everything in them.
  purge(ids: readonly string[]): Promise<void>;
  // Marks folders as favorites, or unmarks them. Not the root.
  setFavorite(ids: readonly string[], favorite: boolean): Promise<void>;
}

// The folders from the root down to the folder, both included (empty for an unknown id).
function ancestorsOf(folders: readonly Folder[], id: string): Folder[] {
  const path: Folder[] = [];

  for (let folder = folders.find((candidate) => candidate.id === id); folder !== undefined;) {
    path.unshift(folder);
    folder = folder.parentId === null ? undefined : folders.find((candidate) => candidate.id === folder?.parentId);
  }

  return path;
}

function childrenOf(folders: readonly Folder[], id: string): Folder[] {
  return folders.filter((folder) => folder.parentId === id);
}

// Whether the folder `id` is the folder `ancestorId` or somewhere inside it.
function isInside(folders: readonly Folder[], id: string, ancestorId: string): boolean {
  return ancestorsOf(folders, id).some((folder) => folder.id === ancestorId);
}
