import type { FileSortKey, Paging, Sort } from '../../domain';
import type { EntryCriteria } from './service';

export { browserKeys };

// The query keys of the feature (TanStack Query): every read under `all`, so a change invalidates them together.
const browserKeys = {
  all: ['media'] as const,
  folders: () => [...browserKeys.all, 'folders'] as const,
  entries: () => [...browserKeys.all, 'entries'] as const,
  entryPage: (folderId: string, criteria: EntryCriteria, sort: Sort<FileSortKey> | undefined, paging: Paging) =>
    [...browserKeys.entries(), { folderId, criteria, sort, paging }] as const,
  owners: () => [...browserKeys.all, 'owners'] as const,
  details: (id: string) => [...browserKeys.all, 'details', id] as const,
};
