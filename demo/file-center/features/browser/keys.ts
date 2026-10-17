export { browserKeys };

// The query keys of the feature (TanStack Query): every read under `all`, so a change invalidates them together.
const browserKeys = {
  all: ['media'] as const,
  folders: () => [...browserKeys.all, 'folders'] as const,
  entries: () => [...browserKeys.all, 'entries'] as const,
  // The files of all folders (Recent).
  files: () => [...browserKeys.all, 'files'] as const,
  // The favorites (folders and files).
  favorites: () => [...browserKeys.all, 'favorites'] as const,
  // The trash.
  trash: () => [...browserKeys.all, 'trash'] as const,
  owners: () => [...browserKeys.all, 'owners'] as const,
  details: (id: string) => [...browserKeys.all, 'details', id] as const,
  overview: () => [...browserKeys.all, 'overview'] as const,
};
