// The media library's domain (the shared kernel): its entities, how they are queried, and the repository interfaces.
// Pure TypeScript; imports nothing from outside.

export type { FileCriteria, FileDetails, FileKind, FileRepository, FileSortKey, MediaFile } from './file.js';
export { FILE_KINDS, FILE_SORT_KEYS, kindOf, typeOf } from './file.js';
export type { Folder, FolderRepository } from './folder.js';
export { ancestorsOf, childrenOf, isInside, ROOT_ID } from './folder.js';
export type { Page, Paging, Range, Sort } from './query.js';
export type { SavedFilterRepository, SavedTableFilter } from './saved-filter.js';
