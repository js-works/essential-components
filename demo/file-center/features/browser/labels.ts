import type { FileKind } from '../../domain';

export { KIND_LABELS };

// The name of a kind of file (the table's column and filter, the start page).
const KIND_LABELS: Readonly<Record<FileKind, string>> = {
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  document: 'Document',
  spreadsheet: 'Spreadsheet',
  presentation: 'Presentation',
  archive: 'Archive',
  other: 'Other',
};
