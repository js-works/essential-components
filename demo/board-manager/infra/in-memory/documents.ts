import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import type { FileUpload } from '../../../../packages/file-upload/src';
import type { MeetingDocument } from '../../domain';
import { AppError } from './errors';
import { CURRENT_USER, localDateTime, typeOf } from './helpers';
import { matches, oneOf, runQuery, within } from './query';
import { db, LOADING_TIME, newId, save, wait } from './store';

export { commitDocuments, deleteDocuments, discardDocuments, fetchDocuments, renameDocument, uploadDocument };

function fetchDocuments(meetingId: string): DataTableComponent.Source<MeetingDocument> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const rows = db.getState().documents.filter((document) => document.meetingId === meetingId);

    return runQuery(rows, query, {
      search: ['name', 'type', 'user'],
      filters: {
        name: (row, value) => matches(row.name, value),
        type: (row, value) => oneOf(row.type, value),
        user: (row, value) => oneOf(row.user, value),
        uploaded: (row, value) => within(row.uploaded, value),
      },
    });
  };
}

// The upload function of the file upload, for the documents of one meeting: the time depends on the size, the progress
// is reported, and at the end the file is staged (on the server, not in the list yet) and its id is the result.
// `commitDocuments` adds staged files ("Apply" of the upload drawer), `discardDocuments` drops them ("Cancel").
const staged = new Map<string, MeetingDocument>();

function uploadDocument(meetingId: string): FileUpload.Upload {
  return async (file, { signal, onProgress }) => {
    const duration = Math.min(4000, 800 + file.size / 1000);
    const steps = 10;

    for (let step = 1; step <= steps; step++) {
      await wait(duration / steps, signal);
      onProgress(step / steps);
    }

    const document: MeetingDocument = {
      id: newId('d'),
      meetingId,
      name: file.name,
      type: typeOf(file.name),
      size: file.size,
      user: CURRENT_USER,
      uploaded: localDateTime(new Date()),
    };

    staged.set(document.id, document);

    return document.id;
  };
}

async function commitDocuments(ids: readonly string[]): Promise<readonly MeetingDocument[]> {
  const committed = ids.flatMap((id) => {
    const document = staged.get(id);

    staged.delete(id);

    return document === undefined ? [] : [{ ...document, uploaded: localDateTime(new Date()) }];
  });

  await save((state) => ({ documents: [...state.documents, ...committed] }));

  return committed;
}

function discardDocuments(ids: readonly string[]): void {
  for (const id of ids) {
    staged.delete(id);
  }
}

// Renames a document (the edit form of the documents table): the name trimmed, not empty; the type follows its
// extension, like for an upload.
async function renameDocument(id: string, name: string): Promise<MeetingDocument> {
  const trimmed = name.trim();

  if (trimmed === '') {
    throw new AppError('nameEmpty');
  }

  await save((state) => ({
    documents: state.documents.map((document) =>
      document.id === id ? { ...document, name: trimmed, type: typeOf(trimmed) } : document
    ),
  }));

  const renamed = db.getState().documents.find((document) => document.id === id);

  if (renamed === undefined) {
    throw new AppError('documentMissing');
  }

  return renamed;
}

async function deleteDocuments(ids: readonly string[]): Promise<void> {
  await save((state) => ({ documents: state.documents.filter((document) => !ids.includes(document.id)) }));
}
