import type { DocumentRepository, MeetingDocument } from '../../domain/index.js';
import { localDateTime } from '../../domain/index.js';
import { AppError } from '../../shared/lib/app-error.js';
import { CURRENT_USER, typeOf } from './helpers.js';
import { containsText, inList, inRange, matchesText, pageOf, sorted } from './query.js';
import { db, LOADING_TIME, newId, save, wait } from './store.js';

export { createDocumentRepository };

// The documents of the in-memory store. An upload takes a time that depends on the size and reports its progress; at
// the end the file is staged (on the server, not in the list yet), and its id is the result.
function createDocumentRepository(): DocumentRepository {
  const staged = new Map<string, MeetingDocument>();

  return {
    async find(meetingId, criteria, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const found = db.getState().documents.filter((document) =>
        document.meetingId === meetingId
        && containsText([document.name, document.type, document.user], criteria.text)
        && matchesText(document.name, criteria.name)
        && inList(document.type, criteria.types)
        && inList(document.user, criteria.users)
        && inRange(document.uploaded, criteria.uploaded)
      );

      return pageOf(sorted(found, sort), paging);
    },

    async all(meetingId, signal) {
      await wait(LOADING_TIME, signal);

      return db.getState().documents.filter((document) => document.meetingId === meetingId);
    },

    upload(meetingId) {
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
    },

    async commit(ids) {
      const committed = ids.flatMap((id) => {
        const document = staged.get(id);

        staged.delete(id);

        return document === undefined ? [] : [{ ...document, uploaded: localDateTime(new Date()) }];
      });

      await save((state) => ({ documents: [...state.documents, ...committed] }));

      return committed;
    },

    discard(ids) {
      for (const id of ids) {
        staged.delete(id);
      }
    },

    async rename(id, name) {
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
    },

    async delete(ids) {
      await save((state) => ({ documents: state.documents.filter((document) => !ids.includes(document.id)) }));
    },
  };
}
