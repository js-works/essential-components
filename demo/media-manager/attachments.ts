import type { DataNavigatorComponent } from '../../packages/data-navigator/src/react';
import type { FileUpload } from '../../packages/file-upload/src';

export {
  commitUploads,
  deleteAttachments,
  discardUploads,
  fetchAttachments,
  getDetails,
  SIZES,
  TYPES,
  uploadAttachment,
  USERS,
};
export type { Attachment, Details };

// The fake server of the media manager: the attachments live in memory, for as long as the page is open.

type Attachment = {
  id: string;
  name: string;
  // Who uploaded it.
  user: string;
  // The file type, short: the extension in capitals (`PDF`, `XLSX`), not the MIME type, which can be very long.
  type: string;
  size: number;
  uploaded: string;
};

const LOADING_TIME = 400;

// Deleting takes a while (the confirmation dialog shows its spinner meanwhile).
const DELETE_TIME = 1000;

// Adding the uploaded files to the list takes a while too (the "Apply" button of the upload drawer shows its spinner).
const COMMIT_TIME = 1000;

// The user of the page: new uploads are theirs.
const CURRENT_USER = 'Admin';

// Everyone who has uploaded something (the options of the user filter).
const USERS = ['Admin', 'Ada Lovelace', 'Grace Hopper', 'Linus Torvalds'] as const;

// Common file types (the options of the type filter). A file of another type is shown, but cannot be filtered for.
const TYPES = ['PDF', 'DOCX', 'XLSX', 'CSV', 'TXT', 'JPG', 'PNG', 'ZIP'] as const;

// The size classes of the size filter (1 kB = 1024 bytes): text and office files, PDFs and small images, photos and
// archives.
const SIZES = [
  { value: 'small', label: 'Small (< 100 kB)', min: 0, max: 100 * 1024 },
  { value: 'medium', label: 'Medium (100 kB – 1 MB)', min: 100 * 1024, max: 1024 * 1024 },
  { value: 'large', label: 'Large (≥ 1 MB)', min: 1024 * 1024, max: Infinity },
] as const;

let nextId = 1;

const attachments: Attachment[] = [
  seed('Contract 2026.pdf', 'Admin', 482_133, '2026-08-03T09:12:00Z'),
  seed('Invoice 1042.pdf', 'Grace Hopper', 91_844, '2026-09-01T14:30:00Z'),
  seed('Invoice 1043.pdf', 'Grace Hopper', 88_310, '2026-09-08T10:02:00Z'),
  seed('Floor plan.png', 'Ada Lovelace', 1_838_201, '2026-09-12T08:05:00Z'),
  seed('Site photo 1.jpg', 'Linus Torvalds', 2_402_118, '2026-09-14T11:20:00Z'),
  seed('Site photo 2.jpg', 'Linus Torvalds', 2_188_904, '2026-09-14T11:21:00Z'),
  seed('Budget 2027.xlsx', 'Admin', 36_774, '2026-09-18T13:40:00Z'),
  seed('Meeting notes.txt', 'Ada Lovelace', 4_210, '2026-09-20T16:45:00Z'),
  seed('Offer 2027.docx', 'Grace Hopper', 58_921, '2026-09-21T09:30:00Z'),
  seed('Customers.csv', 'Admin', 12_480, '2026-09-22T15:05:00Z'),
  seed('Site photos.zip', 'Linus Torvalds', 6_734_102, '2026-09-23T10:48:00Z'),
];

function seed(name: string, user: string, size: number, uploaded: string): Attachment {
  return { id: `att-${nextId++}`, name, user, type: typeOf(name), size, uploaded };
}

// The extension in capitals, or `FILE` for a name without one.
function typeOf(name: string): string {
  const dot = name.lastIndexOf('.');

  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}

// Waits a little, like a server would, and stops at once when the signal is aborted.
function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

// A date range filter is `{ from, to }` (yyyy-mm-dd, both inclusive): ISO dates compare as strings.
function within(date: string, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { from, to } = filter as { from?: unknown; to?: unknown };

  return (typeof from !== 'string' || date >= from) && (typeof to !== 'string' || date <= to);
}

// The source of the table: the column filters (filename: contains, user, type and size: one of, uploaded: a date
// range), search (in the name, the user and
// the type), sorting and paging.
async function fetchAttachments(
  query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<Attachment>> {
  await wait(LOADING_TIME, signal);

  const text = query.search.toLowerCase();
  const { name, user, type, size, uploaded } = query.filters;
  const sizeClassOf = (bytes: number) => SIZES.find((entry) => bytes >= entry.min && bytes < entry.max)?.value ?? '';
  const oneOf = (value: string, filter: unknown) =>
    !Array.isArray(filter) || filter.length === 0 || filter.includes(value);
  const rows = attachments
    .filter(
      (attachment) =>
        (typeof name !== 'string' || attachment.name.toLowerCase().includes(name.toLowerCase()))
        && oneOf(attachment.user, user)
        && oneOf(attachment.type, type)
        && oneOf(sizeClassOf(attachment.size), size)
        && within(attachment.uploaded.slice(0, 10), uploaded),
    )
    .filter(
      (attachment) =>
        text === ''
        || [attachment.name, attachment.user, attachment.type].some((value) => value.toLowerCase().includes(text)),
    );

  if (query.sort) {
    const key = query.sort.key as keyof Attachment;
    const factor = query.sort.direction === 'asc' ? 1 : -1;

    rows.sort((a, b) => factor * (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
  }

  const { page, pageSize } = query;

  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length };
}

// The upload function of the file upload: the time depends on the size, the progress is reported, and at the end the
// file is stored and its id is the result (the form value of the file).
// An upload is staged first: the file is on the server, but not in the list yet. `commitUploads` adds staged files
// (the "Apply" of the upload drawer), `discardUploads` drops them (its "Cancel").
const staged = new Map<string, Attachment>();

const uploadAttachment: FileUpload.Upload = async (file, { signal, onProgress }) => {
  const duration = Math.min(4000, 800 + file.size / 1000);
  const steps = 10;

  for (let step = 1; step <= steps; step++) {
    await wait(duration / steps, signal);
    onProgress(step / steps);
  }

  const attachment: Attachment = {
    id: `att-${nextId++}`,
    name: file.name,
    user: CURRENT_USER,
    type: typeOf(file.name),
    size: file.size,
    uploaded: new Date().toISOString(),
  };

  staged.set(attachment.id, attachment);

  return attachment.id;
};

// Adds the staged files with these ids to the list and returns them (unknown ids are skipped).
async function commitUploads(ids: readonly string[]): Promise<readonly Attachment[]> {
  await wait(COMMIT_TIME, new AbortController().signal);

  const committed = ids.flatMap((id) => {
    const attachment = staged.get(id);

    staged.delete(id);

    return attachment === undefined ? [] : [{ ...attachment, uploaded: new Date().toISOString() }];
  });

  attachments.push(...committed);

  return committed;
}

function discardUploads(ids: readonly string[]): void {
  for (const id of ids) {
    staged.delete(id);
  }
}

// More about one attachment, for its information drawer. All made up, but stable per attachment.
type Details = {
  checksum: string;
  storage: string;
  versions: number;
  downloads: number;
  tags: readonly string[];
  description: string;
};

const TAGS = ['contract', 'finance', 'project', 'photo', 'internal', 'archive'] as const;

async function getDetails(attachment: Attachment): Promise<Details> {
  await wait(LOADING_TIME, new AbortController().signal);

  // A number from the id, the seed of every made-up value.
  const seed = [...attachment.id].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
  // 64 hex digits from a small xorshift generator, so the checksum looks like one.
  let state = seed || 1;
  const digits = Array.from({ length: 64 }, () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 16).toString(16);
  });

  return {
    checksum: `sha256:${digits.join('')}`,
    storage: `s3://files/${attachment.uploaded.slice(0, 7)}/${attachment.id}`,
    versions: 1 + seed % 4,
    downloads: seed % 57,
    tags: [TAGS[seed % TAGS.length] ?? 'internal', TAGS[(seed >> 3) % TAGS.length] ?? 'archive'].filter(
      (tag, index, all) => all.indexOf(tag) === index,
    ),
    description: `Uploaded by ${attachment.user}. Scanned for viruses, nothing found. Visible to the project team.`,
  };
}

// Deletes one or several attachments in one request.
async function deleteAttachments(ids: readonly string[]): Promise<void> {
  await wait(DELETE_TIME, new AbortController().signal);

  for (const id of ids) {
    const index = attachments.findIndex((attachment) => attachment.id === id);

    if (index >= 0) {
      attachments.splice(index, 1);
    }
  }
}
