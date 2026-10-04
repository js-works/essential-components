import { createStore } from 'zustand/vanilla';
import type {
  AgendaItem,
  AgendaSection,
  Board,
  Meeting,
  MeetingDocument,
  Membership,
  Organization,
  Person,
} from '../../domain';
import { seedDb } from './seed';

export { db, LOADING_TIME, newId, save, SAVE_TIME, wait };
export type { Db };

// The fake server of the board manager: every table lives in memory (a Zustand store, so the pages can follow it), for
// as long as the page is open. The seed is made up but stable (a seeded random generator), and its dates are relative
// to today: there are always held meetings with minutes, and planned ones with an agenda.

type Db = {
  boards: readonly Board[];
  organizations: readonly Organization[];
  people: readonly Person[];
  memberships: readonly Membership[];
  meetings: readonly Meeting[];
  agendaItems: readonly AgendaItem[];
  agendaSections: readonly AgendaSection[];
  documents: readonly MeetingDocument[];
};

const LOADING_TIME = 300;

// Saving takes a while, so the buttons of the dialogs show their spinner.
const SAVE_TIME = 700;

const db = createStore<Db>()(() => seedDb());

let nextId = 10_000;

const newId = (prefix: string) => `${prefix}${nextId++}`;

// Waits a little, like a server would, and stops at once when the signal is aborted.
function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const timer = setTimeout(resolve, ms);

    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

async function save(change: (state: Db) => Partial<Db>): Promise<void> {
  await wait(SAVE_TIME);
  db.setState(change);
}
