import type { Folder, MediaFile } from '../../domain';

export {
  createStore,
  CURRENT_USER,
  liveFolderIds,
  LOADING_TIME,
  localDateTime,
  SAVE_TIME,
  wait,
  withFavorite,
  withoutDeletedAt,
};
export type { Store };

// The fake server's data: every folder and file, in memory for as long as the page is open. Both repositories share
// one store (deleting a folder deletes its files).
type Store = {
  folders: Folder[];
  files: MediaFile[];
  // Uploaded but not added yet (an upload drawer still open).
  staged: Map<string, MediaFile>;
  newId: (prefix: string) => string;
};

function createStore(data: { folders: Folder[]; files: MediaFile[] }): Store {
  let next = 10_000;

  return { ...data, staged: new Map(), newId: (prefix) => `${prefix}${next++}` };
}

// The user of the page: new folders and files are theirs.
const CURRENT_USER = 'Admin';

// A server takes a while: reading a little, saving (the spinners of the dialogs show) a bit longer.
const LOADING_TIME = 250;
const SAVE_TIME = 600;

// Waits like a server would, and stops at once when the signal is aborted.
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

// A folder or file marked as a favorite, or not (without the field then).
function withFavorite<T extends { favorite?: true }>(item: T, favorite: boolean): T {
  const { favorite: _old, ...rest } = item;

  return (favorite ? { ...rest, favorite: true } : rest) as T;
}

// A folder or file out of the trash again.
function withoutDeletedAt<T extends { deletedAt?: string }>(item: T): T {
  const { deletedAt: _old, ...rest } = item;

  return rest as T;
}

// The folders outside the trash (2026-10-08): neither in it themselves nor inside one that is.
function liveFolderIds(store: Store): ReadonlySet<string> {
  const byId = new Map(store.folders.map((folder) => [folder.id, folder]));
  const live = new Set<string>();

  for (const folder of store.folders) {
    let current: Folder | undefined = folder;

    while (current !== undefined && current.deletedAt === undefined) {
      current = current.parentId === null ? undefined : byId.get(current.parentId);

      if (current === undefined) {
        live.add(folder.id);
      }
    }
  }

  return live;
}

const pad = (value: number) => String(value).padStart(2, '0');

// A local date and time without a time zone (`2026-09-15T10:00`): ISO dates compare as strings.
function localDateTime(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${
    pad(date.getMinutes())
  }`;
}
