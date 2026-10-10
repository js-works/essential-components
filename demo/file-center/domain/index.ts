// The media library's domain (the shared kernel): its entities, how they are queried, and the repository interfaces.
// Pure TypeScript; imports nothing from outside.

export { FILE_KINDS, kindOf, typeOf } from './file';
export type { FileCriteria, FileDetails, FileKind, FileRepository, FileSortKey, MediaFile } from './file';
export { ancestorsOf, childrenOf, isInside, ROOT_ID } from './folder';
export type { Folder, FolderRepository } from './folder';
export type { Page, Paging, Range, Sort } from './query';
