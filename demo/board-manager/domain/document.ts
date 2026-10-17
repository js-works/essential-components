import type { Page, Paging, Range, Sort, TextMatch } from './query.js';

export type { DocumentCriteria, DocumentRepository, DocumentSortKey, MeetingDocument, UploadDocument };
export { DOCUMENT_SORT_KEYS };

// The type is the extension in capitals (`PDF`), like in the File Center.
type MeetingDocument = {
  id: string;
  meetingId: string;
  name: string;
  type: string;
  size: number;
  user: string;
  uploaded: string;
};

// Which documents of a meeting a list asks for: a text in the name, the type or the user; the name matching; one of
// the types, users; uploaded within a range of days.
type DocumentCriteria = {
  text?: string;
  name?: TextMatch;
  types?: readonly string[];
  users?: readonly string[];
  uploaded?: Range<string>;
};

// What the documents can be sorted by.
const DOCUMENT_SORT_KEYS = ['name', 'type', 'size', 'user', 'uploaded'] as const;

type DocumentSortKey = (typeof DOCUMENT_SORT_KEYS)[number];

// The upload of one file (the file upload's function): it reports its progress and gives the staged document's id.
type UploadDocument = (
  file: File,
  options: { signal: AbortSignal; onProgress: (progress: number) => void },
) => Promise<string>;

// What can be done with a meeting's documents. An upload stages a file (on the server, not in the list yet): `commit`
// adds staged files, `discard` drops them. A rename trims the name and refuses an empty one (`AppError`); the type
// follows the extension.
interface DocumentRepository {
  find(
    meetingId: string,
    criteria: DocumentCriteria,
    sort: Sort<DocumentSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<MeetingDocument>>;
  all(meetingId: string, signal?: AbortSignal): Promise<readonly MeetingDocument[]>;
  upload(meetingId: string): UploadDocument;
  commit(ids: readonly string[]): Promise<readonly MeetingDocument[]>;
  discard(ids: readonly string[]): void;
  rename(id: string, name: string): Promise<MeetingDocument>;
  delete(ids: readonly string[]): Promise<void>;
}
