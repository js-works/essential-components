import type { FileCriteria, FileSortKey, Paging, Sort } from '../../domain';
import type { EntryCriteria, TrashSortKey } from './service';

export { browserKeys };

// The query keys of the feature (TanStack Query): every read under `all`, so a change invalidates them together.
const browserKeys = {
  all: ['media'] as const,
  folders: () => [...browserKeys.all, 'folders'] as const,
  entries: () => [...browserKeys.all, 'entries'] as const,
  entryPage: (folderId: string, criteria: EntryCriteria, sort: Sort<FileSortKey> | undefined, paging: Paging) =>
    [...browserKeys.entries(), { folderId, criteria, sort, paging }] as const,
  // A page of the files of all folders (Recent).
  files: () => [...browserKeys.all, 'files'] as const,
  filePage: (criteria: FileCriteria, sort: Sort<FileSortKey> | undefined, paging: Paging) =>
    [...browserKeys.files(), { criteria, sort, paging }] as const,
  // A page of the favorites (folders and files).
  favorites: () => [...browserKeys.all, 'favorites'] as const,
  favoritePage: (criteria: EntryCriteria, sort: Sort<FileSortKey> | undefined, paging: Paging) =>
    [...browserKeys.favorites(), { criteria, sort, paging }] as const,
  // A page of the trash.
  trash: () => [...browserKeys.all, 'trash'] as const,
  trashPage: (text: string, sort: Sort<TrashSortKey> | undefined, paging: Paging) =>
    [...browserKeys.trash(), { text, sort, paging }] as const,
  owners: () => [...browserKeys.all, 'owners'] as const,
  details: (id: string) => [...browserKeys.all, 'details', id] as const,
  overview: () => [...browserKeys.all, 'overview'] as const,
};
