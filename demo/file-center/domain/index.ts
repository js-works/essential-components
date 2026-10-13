// The media library's domain (the shared kernel): its entities, how they are queried, and the repository interfaces.
// Pure TypeScript; imports nothing from outside.

export { FILE_KINDS, kindOf, typeOf } from './file.js';
export type { FileCriteria, FileDetails, FileKind, FileRepository, FileSortKey, MediaFile } from './file.js';
export { ancestorsOf, childrenOf, isInside, ROOT_ID } from './folder.js';
export type { Folder, FolderRepository } from './folder.js';
export type { Page, Paging, Range, Sort } from './query.js';
