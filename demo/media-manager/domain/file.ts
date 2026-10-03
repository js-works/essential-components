import type { Page, Paging, Range, Sort } from './query';

export { FILE_KINDS, kindOf, typeOf };
export type { FileCriteria, FileDetails, FileKind, FileRepository, FileSortKey, MediaFile };

// What a file is, by its extension.
const FILE_KINDS = ['image', 'video', 'audio', 'document', 'spreadsheet', 'presentation', 'archive', 'other'] as const;

type FileKind = (typeof FILE_KINDS)[number];

// A file of the media library, in one folder.
type MediaFile = {
  id: string;
  folderId: string;
  name: string;
  // The extension in capitals (`PDF`), or `FILE` without one.
  type: string;
  kind: FileKind;
  // In bytes.
  size: number;
  // An ISO date and time.
  modified: string;
  owner: string;
};

// More about a file, loaded on demand (made up, but stable per file).
type FileDetails = {
  description: string;
  tags: readonly string[];
  versions: number;
  downloads: number;
  checksum: string;
  // Images and videos: `1920 × 1080`.
  dimensions?: string;
  // Videos and audio: `3:42`.
  duration?: string;
};

// What files can be searched by. `text`: the name contains it (ignoring the case).
type FileCriteria = {
  folderId?: string;
  text?: string;
  kinds?: readonly FileKind[];
  owners?: readonly string[];
  modified?: Range<string>;
};

type FileSortKey = 'name' | 'type' | 'size' | 'modified' | 'owner';

// The files, independent of where they are kept.
interface FileRepository {
  find(
    criteria: FileCriteria,
    sort: Sort<FileSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<MediaFile>>;
  // Everyone who owns a file.
  owners(signal?: AbortSignal): Promise<readonly string[]>;
  details(id: string, signal?: AbortSignal): Promise<FileDetails>;
  // An upload into a folder: reports its progress (0 to 1), and ends with the id of the staged file (not in the
  // folder yet): `commit` adds staged files, `discard` drops them.
  upload(folderId: string, file: File, onProgress: (fraction: number) => void, signal: AbortSignal): Promise<string>;
  commit(ids: readonly string[]): Promise<readonly MediaFile[]>;
  discard(ids: readonly string[]): void;
  // The name is trimmed; an empty one is refused. The type and the kind follow the new extension.
  rename(id: string, name: string): Promise<MediaFile>;
  move(ids: readonly string[], folderId: string): Promise<void>;
  delete(ids: readonly string[]): Promise<void>;
}

const EXTENSIONS: Readonly<Record<Exclude<FileKind, 'other'>, readonly string[]>> = {
  image: ['JPG', 'JPEG', 'PNG', 'GIF', 'SVG', 'WEBP', 'HEIC', 'TIFF'],
  video: ['MP4', 'MOV', 'WEBM', 'AVI', 'MKV'],
  audio: ['MP3', 'WAV', 'M4A', 'FLAC', 'OGG'],
  document: ['PDF', 'DOC', 'DOCX', 'TXT', 'MD', 'RTF', 'ODT'],
  spreadsheet: ['XLS', 'XLSX', 'CSV', 'ODS'],
  presentation: ['PPT', 'PPTX', 'KEY', 'ODP'],
  archive: ['ZIP', 'TAR', 'GZ', '7Z', 'RAR'],
};

// The extension in capitals, or `FILE` for a name without one.
function typeOf(name: string): string {
  const dot = name.lastIndexOf('.');

  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}

function kindOf(name: string): FileKind {
  const type = typeOf(name);

  return (Object.entries(EXTENSIONS) as [FileKind, readonly string[]][]).find(([, types]) => types.includes(type))?.[0]
    ?? 'other';
}
