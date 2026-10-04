export { ancestorsOf, childrenOf, isInside, ROOT_ID };
export type { Folder, FolderRepository };

// A folder of the media library. The root is a folder too (`ROOT_ID`, without a parent): "All files".
type Folder = {
  id: string;
  // `null` only for the root.
  parentId: string | null;
  name: string;
  // An ISO date and time.
  created: string;
  owner: string;
};

const ROOT_ID = 'root';

// The folders, independent of where they are kept. Folders are few, so they are read all at once (the tree).
interface FolderRepository {
  all(signal?: AbortSignal): Promise<readonly Folder[]>;
  // The name is trimmed; an empty one, or one a sibling has already (ignoring the case), is refused.
  create(parentId: string, name: string): Promise<Folder>;
  rename(id: string, name: string): Promise<Folder>;
  // Into another folder; never into itself or one of its own subfolders.
  move(ids: readonly string[], parentId: string): Promise<void>;
  // With everything in it: its subfolders and their files.
  delete(ids: readonly string[]): Promise<void>;
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
