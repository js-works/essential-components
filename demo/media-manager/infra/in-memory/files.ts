import { kindOf, typeOf } from '../../domain';
import type { FileDetails, FileRepository, MediaFile } from '../../domain';
import { OWNERS } from './seed';
import { CURRENT_USER, LOADING_TIME, localDateTime, SAVE_TIME, wait } from './store';
import type { Store } from './store';

export { createFileRepository };

const TAGS = ['final', 'draft', 'approved', 'internal', 'external', 'print', 'web', 'archive', 'review', 'legal'];

const DESCRIPTIONS = [
  'The current version, shared with the whole team.',
  'Prepared for the next review round.',
  'Received from the agency, not changed since.',
  'Exported from the original file for the web.',
  'Kept for reference.',
];

// A number from a text (FNV-1a), for made-up details that stay the same for a file.
function hash(text: string): number {
  let value = 2166136261;

  for (const char of text) {
    value = Math.imul(value ^ (char.codePointAt(0) ?? 0), 16777619) >>> 0;
  }

  return value;
}

function createFileRepository(store: Store): FileRepository {
  const find = (id: string) => store.files.find((file) => file.id === id);

  return {
    async find(criteria, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const text = criteria.text?.trim().toLowerCase() ?? '';
      const { from, to } = criteria.modified ?? {};
      const matching = store.files.filter((file) =>
        (criteria.folderId === undefined || file.folderId === criteria.folderId)
        && (text === '' || file.name.toLowerCase().includes(text))
        && (criteria.kinds === undefined || criteria.kinds.length === 0 || criteria.kinds.includes(file.kind))
        && (criteria.owners === undefined || criteria.owners.length === 0 || criteria.owners.includes(file.owner))
        && (from === undefined || file.modified.slice(0, 10) >= from)
        && (to === undefined || file.modified.slice(0, 10) <= to)
      );

      if (sort !== undefined) {
        const factor = sort.direction === 'asc' ? 1 : -1;

        matching.sort((a, b) => {
          const [left, right] = [a[sort.key], b[sort.key]];

          return factor * (typeof left === 'number' && typeof right === 'number'
            ? left - right
            : String(left).localeCompare(String(right), 'en', { numeric: true }));
        });
      }

      return { items: matching.slice(paging.offset, paging.offset + paging.limit), total: matching.length };
    },

    async owners(signal) {
      await wait(LOADING_TIME, signal);

      return [...OWNERS];
    },

    async details(id, signal) {
      await wait(LOADING_TIME * 3, signal);

      const file = find(id);

      if (file === undefined) {
        throw new Error('The file does not exist anymore.');
      }

      const seed = hash(file.id + file.name);
      const details: FileDetails = {
        description: DESCRIPTIONS[seed % DESCRIPTIONS.length] ?? '',
        tags: [TAGS[seed % TAGS.length] ?? '', TAGS[(seed >>> 4) % TAGS.length] ?? ''].filter((tag, index, all) =>
          all.indexOf(tag) === index
        ),
        versions: 1 + (seed % 6),
        downloads: (seed >>> 3) % 400,
        checksum: `sha256:${seed.toString(16).padStart(8, '0')}${hash(file.name).toString(16).padStart(8, '0')}…`,
      };

      if (file.kind === 'image' || file.kind === 'video') {
        const [width, height] = [[1920, 1080], [3840, 2160], [1200, 800], [800, 800], [4032, 3024]][seed % 5] ?? [];

        details.dimensions = `${width} × ${height}`;
      }

      if (file.kind === 'video' || file.kind === 'audio') {
        const seconds = 20 + (seed % 900);

        details.duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      }

      return details;
    },

    async upload(folderId, file, onProgress, signal) {
      const duration = Math.min(4000, 800 + file.size / 1000);
      const steps = 10;

      for (let step = 1; step <= steps; step++) {
        await wait(duration / steps, signal);
        onProgress(step / steps);
      }

      const staged: MediaFile = {
        id: store.newId('f'),
        folderId,
        name: file.name,
        type: typeOf(file.name),
        kind: kindOf(file.name),
        size: file.size,
        modified: localDateTime(new Date()),
        owner: CURRENT_USER,
      };

      store.staged.set(staged.id, staged);

      return staged.id;
    },

    async commit(ids) {
      await wait(SAVE_TIME);

      const committed = ids.flatMap((id) => {
        const file = store.staged.get(id);

        store.staged.delete(id);

        return file === undefined ? [] : [{ ...file, modified: localDateTime(new Date()) }];
      });

      store.files.push(...committed);

      return committed;
    },

    discard(ids) {
      for (const id of ids) {
        store.staged.delete(id);
      }
    },

    async rename(id, name) {
      await wait(SAVE_TIME);

      const trimmed = name.trim();
      const file = find(id);

      if (trimmed === '') {
        throw new Error('The name must not be empty.');
      }

      if (file === undefined) {
        throw new Error('The file does not exist anymore.');
      }

      const renamed = { ...file, name: trimmed, type: typeOf(trimmed), kind: kindOf(trimmed) };

      store.files = store.files.map((candidate) => (candidate.id === id ? renamed : candidate));

      return renamed;
    },

    async move(ids, folderId) {
      await wait(SAVE_TIME);

      store.files = store.files.map((file) => (ids.includes(file.id) ? { ...file, folderId } : file));
    },

    async delete(ids) {
      await wait(SAVE_TIME);

      store.files = store.files.filter((file) => !ids.includes(file.id));
    },
  };
}
