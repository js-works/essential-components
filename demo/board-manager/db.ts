import { createStore } from 'zustand/vanilla';
import type { DataNavigatorComponent } from '../../packages/data-navigator/src/react';
import type { FileUpload } from '../../packages/file-upload/src';

export {
  addMember,
  agendaNumbers,
  agendaOf,
  approveMinutes,
  changeRole,
  commitDocuments,
  createAgendaItem,
  createBoard,
  createMeeting,
  createPerson,
  CURRENT_USER,
  db,
  deleteAgendaItems,
  deleteBoards,
  deleteDocuments,
  deleteMeetings,
  deletePeople,
  discardDocuments,
  fetchAgenda,
  fetchBoardMembers,
  fetchBoards,
  fetchDocuments,
  fetchMeetings,
  fetchPeople,
  getBoard,
  getMeeting,
  getPerson,
  localDateTime,
  MEETING_STATUSES,
  newSectionId,
  removeMembers,
  reorderAgenda,
  ROLES,
  saveSectionDraft,
  setMeetingStatus,
  updateAgendaItem,
  updateBoard,
  updateMeeting,
  updatePerson,
  uploadDocument,
  withSectionDraft,
};
export type {
  AgendaEntry,
  AgendaItem,
  AgendaRow,
  AgendaSection,
  Board,
  BoardRow,
  Db,
  Meeting,
  MeetingDocument,
  MeetingRow,
  MeetingStatus,
  MemberRow,
  Membership,
  Person,
  PersonRow,
  Role,
  SectionDraft,
};

// The fake server of the board manager: every table lives in memory (a Zustand store, so the pages can follow it), for
// as long as the page is open. The seed is made up but stable (a seeded random generator), and its dates are relative
// to today: there are always held meetings with minutes, and planned ones with an agenda.

type Board = { id: string; name: string; description: string };

type Person = { id: string; name: string; email: string; organization: string };

const ROLES = ['Chair', 'Vice chair', 'Secretary', 'Member'] as const;

type Role = (typeof ROLES)[number];

type Membership = { id: string; boardId: string; personId: string; role: Role; since: string };

const MEETING_STATUSES = ['Planned', 'Held', 'Cancelled'] as const;

type MeetingStatus = (typeof MEETING_STATUSES)[number];

// `start` is a local date and time without a time zone (`2026-09-15T10:00`): ISO dates compare as strings.
type Meeting = {
  id: string;
  boardId: string;
  title: string;
  start: string;
  location: string;
  status: MeetingStatus;
  minutesApproved: boolean;
};

// `presenterId` is a person; `minutes` and `decision` are empty until they are recorded. `sectionId`: the section the
// item is in, or `''`.
type AgendaItem = {
  id: string;
  meetingId: string;
  position: number;
  sectionId: string;
  title: string;
  presenterId: string;
  duration: number;
  description: string;
  minutes: string;
  decision: string;
};

// A section of an agenda: it groups items (one level). Sections and items share one order (`position`) per meeting, and
// the items of a section always follow it (`arranged()`).
type AgendaSection = { id: string; meetingId: string; position: number; title: string };

// The type is the extension in capitals (`PDF`), like in the media manager.
type MeetingDocument = {
  id: string;
  meetingId: string;
  name: string;
  type: string;
  size: number;
  user: string;
  uploaded: string;
};

type Db = {
  boards: readonly Board[];
  people: readonly Person[];
  memberships: readonly Membership[];
  meetings: readonly Meeting[];
  agendaItems: readonly AgendaItem[];
  agendaSections: readonly AgendaSection[];
  documents: readonly MeetingDocument[];
};

// The rows of the tables: a record with what the table shows of its relations.
type BoardRow = Board & { chair: string; members: number; meetings: number; nextMeeting: string };

type MeetingRow = Meeting & { board: string; items: number; documents: number };

// `number`: `2` for an item without a section, `2.1` for an item in a section.
type AgendaRow = AgendaItem & { number: string; presenter: string; recorded: 'Yes' | 'No' };

// The sections of a meeting as the "Sections" drawer changes them, until "Apply": their order and names. A section of
// the meeting that is missing is deleted; one with a new id (`newSectionId()`) is added.
type SectionDraft = readonly { id: string; title: string }[];

type MemberRow = Membership & { name: string; email: string; organization: string };

type PersonRow = Person & { boards: string; roles: string; boardIds: readonly string[] };

// The user of the page: new documents are theirs.
const CURRENT_USER = 'Admin';

const LOADING_TIME = 300;

// Saving takes a while, so the buttons of the dialogs show their spinner.
const SAVE_TIME = 700;

// ---------------------------------------------------------------------------------------------------------------------
// The seed
// ---------------------------------------------------------------------------------------------------------------------

// A small seeded generator (mulberry32): the same seed, the same data.
function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

const random = createRandom(2026);

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(random() * values.length)] as T;
}

function shuffled<T>(values: readonly T[]): T[] {
  const copy = [...values];

  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1));
    [copy[index], copy[other]] = [copy[other] as T, copy[index] as T];
  }

  return copy;
}

const pad = (value: number) => String(value).padStart(2, '0');

function localDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function localDateTime(date: Date): string {
  return `${localDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

const PEOPLE: readonly (readonly [string, string])[] = [
  ['Helena Brandt', 'Brandt Holding'],
  ['Markus Weller', 'Company'],
  ['Sofia Lindqvist', 'Nordic Capital Partners'],
  ['Jonas Albrecht', 'Company'],
  ['Amira Haddad', 'Haddad & Partner Law'],
  ['Thomas Keller', 'Company'],
  ['Claire Dubois', 'Independent'],
  ['Viktor Horvath', 'Employee representative'],
  ['Mei-Ling Chen', 'Company'],
  ['Daniel Fischer', 'Company'],
  ['Laura Moreno', 'Independent'],
  ['Peter Novak', 'Employee representative'],
  ['Anna Schröder', 'Company'],
  ['Omar Farouk', 'Gulf Invest'],
  ['Katharina Wolf', 'Company'],
  ['Lukas Berger', 'Employee representative'],
  ['Isabel Costa', 'Independent'],
  ['Felix Hartmann', 'Company'],
  ['Nadia Petrova', 'Employee representative'],
  ['Ben Carter', 'Carter Advisory'],
  ['Julia Richter', 'Company'],
  ['Hannes Vogel', 'Employee representative'],
  ['Lea Zimmermann', 'Company'],
  ['Martin Kovács', 'Employee representative'],
  ['Sarah Klein', 'Independent'],
  ['Wei Zhang', 'Company'],
  ['Elena Popescu', 'Employee representative'],
  ['Robert Stein', 'Stein Family Office'],
];

type BoardSeed = {
  name: string;
  description: string;
  size: number;
  // One meeting every `every` months, from `from` to `to` months from now.
  every: number;
  from: number;
  to: number;
  kind: string;
  topics: readonly string[];
};

const BOARD_SEEDS: readonly BoardSeed[] = [
  {
    name: 'Supervisory Board',
    description: 'Oversees the Executive Board, appoints its members and approves the annual financial statements.',
    size: 9,
    every: 3,
    from: -15,
    to: 6,
    kind: 'Quarterly meeting',
    topics: [
      'Report of the Executive Board',
      'Annual financial statements',
      'Budget for the next year',
      'Report of the Audit Committee',
      'Report of the Remuneration Committee',
      'Strategy update',
      'Acquisition of a minority stake',
      'Appointment of the auditor',
      'Corporate governance statement',
      'Risk report',
      'Succession planning',
      'Investment in the new plant',
    ],
  },
  {
    name: 'Executive Board',
    description: 'Runs the company: strategy, operations, finance and the organization.',
    size: 5,
    every: 1,
    from: -9,
    to: 3,
    kind: 'Monthly meeting',
    topics: [
      'Monthly financial report',
      'Sales pipeline',
      'Hiring plan',
      'IT security incident review',
      'Price adjustment',
      'Product roadmap',
      'Office relocation',
      'Supplier contracts',
      'Customer satisfaction survey',
      'Liquidity planning',
      'Works agreement on mobile work',
      'Trade fair participation',
    ],
  },
  {
    name: 'Audit Committee',
    description: 'Prepares the audit of the annual financial statements and monitors the risk management.',
    size: 4,
    every: 2,
    from: -14,
    to: 6,
    kind: 'Committee meeting',
    topics: [
      'Audit plan',
      'Findings of the internal audit',
      'Quarterly report',
      'Independence of the auditor',
      'Compliance report',
      'Internal control system',
      'Tax audit',
      'Fees of the auditor',
    ],
  },
  {
    name: 'Remuneration Committee',
    description: 'Prepares the remuneration of the Executive Board and its targets.',
    size: 3,
    every: 4,
    from: -16,
    to: 8,
    kind: 'Committee meeting',
    topics: [
      'Targets of the Executive Board',
      'Achievement of the targets',
      'Remuneration report',
      'Pension commitments',
      'Review of the remuneration system',
    ],
  },
  {
    name: 'Sustainability Committee',
    description: 'Sets the sustainability targets and reviews the progress towards them.',
    size: 5,
    every: 3,
    from: -12,
    to: 6,
    kind: 'Committee meeting',
    topics: [
      'Carbon footprint',
      'Sustainability report',
      'Supply chain due diligence',
      'Energy efficiency program',
      'Diversity targets',
      'Green electricity contract',
      'Fleet electrification',
    ],
  },
  {
    name: 'Works Council',
    description: 'Represents the employees: working hours, health and safety, and the works agreements.',
    size: 7,
    every: 1,
    from: -7,
    to: 3,
    kind: 'Regular meeting',
    topics: [
      'Overtime regulation',
      'Health and safety report',
      'Company pension scheme',
      'Training budget',
      'Shift schedule',
      'Canteen',
      'Hiring of new employees',
      'Staff party',
    ],
  },
];

const LOCATIONS = ['Board room, headquarters', 'Conference room 2.14', 'Video conference', 'Hotel am Park, Stuttgart'];

const TIMES = [[9, 0], [10, 0], [14, 0], [15, 30]] as const;

const DISCUSSION = [
  'The members asked about the assumptions and the risks.',
  'The members discussed the proposal in detail.',
  'There were several questions, all of which were answered.',
  'The discussion focused on the timeline and the costs.',
  'The members welcomed the progress.',
];

function seedDb(): Db {
  let nextId = 1;
  const id = (prefix: string) => `${prefix}${nextId++}`;
  const now = new Date();
  const people: Person[] = PEOPLE.map(([name, organization]) => ({
    id: id('p'),
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    organization,
  }));
  const boards: Board[] = [];
  const memberships: Membership[] = [];
  const meetings: Meeting[] = [];
  const agendaItems: AgendaItem[] = [];
  const agendaSections: AgendaSection[] = [];
  const documents: MeetingDocument[] = [];
  // The sections have ids of their own (`s1`, ...), so the ids of everything else do not change with them.
  let nextSection = 1;

  for (const seed of BOARD_SEEDS) {
    const board: Board = { id: id('b'), name: seed.name, description: seed.description };
    const members = shuffled(people).slice(0, seed.size);

    boards.push(board);
    members.forEach((person, index) => {
      memberships.push({
        id: id('ms'),
        boardId: board.id,
        personId: person.id,
        role: ROLES[Math.min(index, 3)] ?? 'Member',
        since: localDate(new Date(now.getFullYear() - 1 - Math.floor(random() * 6), Math.floor(random() * 12), 1)),
      });
    });

    const [chair, , secretary] = members;
    const boardMeetings: Meeting[] = [];

    for (let month = seed.from; month <= seed.to; month += seed.every) {
      const [hours, minutes] = pick(TIMES);
      const date = new Date(now.getFullYear(), now.getMonth() + month, 8 + Math.floor(random() * 18), hours, minutes);

      // Not on a weekend.
      date.setDate(date.getDate() + (date.getDay() === 6 ? -1 : date.getDay() === 0 ? 1 : 0));

      const held = date < now;
      const period = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
      const meeting: Meeting = {
        id: id('m'),
        boardId: board.id,
        title: seed.every === 3 && seed.name === 'Supervisory Board'
          ? `${seed.kind} Q${Math.floor(date.getMonth() / 3) + 1} ${date.getFullYear()}`
          : `${seed.kind} ${period}`,
        start: localDateTime(date),
        location: pick(LOCATIONS),
        status: held ? (random() < 0.08 ? 'Cancelled' : 'Held') : 'Planned',
        minutesApproved: false,
      };

      boardMeetings.push(meeting);
    }

    // The minutes of every held meeting are approved, except those of the latest one (approved at the next meeting).
    const heldMeetings = boardMeetings.filter((meeting) => meeting.status === 'Held');

    for (const meeting of heldMeetings.slice(0, -1)) {
      meeting.minutesApproved = true;
    }

    // Only the next planned meeting has its full agenda already; the later ones only the standard items.
    const next = boardMeetings.find((meeting) => meeting.status === 'Planned');

    for (const meeting of boardMeetings) {
      const recorded = meeting.status === 'Held';
      const time = meeting.start.slice(11);
      const presenterOf = () => pick(members).id;
      const topics = meeting.status === 'Planned' && meeting !== next
        ? []
        : shuffled(seed.topics).slice(0, 3 + Math.floor(random() * 4));
      const items: Omit<AgendaItem, 'id' | 'meetingId' | 'position' | 'sectionId'>[] = [
        {
          title: 'Opening and adoption of the agenda',
          presenterId: chair?.id ?? presenterOf(),
          duration: 5,
          description: 'Welcome, quorum, adoption of the agenda.',
          minutes: recorded
            ? `${
              chair?.name ?? 'The chair'
            } opened the meeting at ${time} and welcomed the members. The quorum was established.`
            : '',
          decision: recorded ? 'The agenda was adopted without changes.' : '',
        },
        {
          title: 'Approval of the minutes of the last meeting',
          presenterId: secretary?.id ?? presenterOf(),
          duration: 5,
          description: 'The minutes were sent with the invitation.',
          minutes: recorded ? 'There were no comments on the minutes.' : '',
          decision: recorded ? 'The minutes of the last meeting were approved.' : '',
        },
        ...topics.map((topic) => {
          const presenterId = presenterOf();
          const presenter = people.find((person) => person.id === presenterId)?.name ?? 'The presenter';
          const decision = pick([
            `The board approved the ${lowerFirst(topic)}.`,
            `The board took note of the ${lowerFirst(topic)}.`,
            `${presenter} will present a revised proposal at the next meeting.`,
            '',
          ]);

          return {
            title: topic,
            presenterId,
            duration: pick([10, 15, 20, 30, 45]),
            description: `${presenter} presents the ${lowerFirst(topic)}. The documents are in the meeting documents.`,
            minutes: recorded ? `${presenter} presented the ${lowerFirst(topic)}. ${pick(DISCUSSION)}` : '',
            decision: recorded ? decision : '',
          };
        }),
        {
          title: 'Any other business',
          presenterId: chair?.id ?? presenterOf(),
          duration: 10,
          description: '',
          minutes: recorded ? 'There was no other business. The chair closed the meeting.' : '',
          decision: '',
        },
      ];

      // Only an agenda with four topics or more has sections: "Introduction" (the opening and the minutes of the last
      // meeting), then the first half of the topics as reports, the rest as proposals. The others have none (flat).
      const half = Math.ceil(topics.length / 2);
      const sections = topics.length >= 4
        ? [
          { id: `s${nextSection++}`, title: 'Introduction', from: 0, to: 2 },
          { id: `s${nextSection++}`, title: 'Reports', from: 2, to: 2 + half },
          { id: `s${nextSection++}`, title: 'Proposals for decision', from: 2 + half, to: 2 + topics.length },
        ]
        : [];
      let position = 0;

      items.forEach((item, index) => {
        const section = sections.find((candidate) => index >= candidate.from && index < candidate.to);

        if (section !== undefined && index === section.from) {
          agendaSections.push({ id: section.id, meetingId: meeting.id, position: ++position, title: section.title });
        }

        agendaItems.push({
          ...item,
          id: id('a'),
          meetingId: meeting.id,
          position: ++position,
          sectionId: section?.id ?? '',
        });
      });

      // The documents: the invitation always, the board pack and the presentations once the agenda is complete, and
      // the minutes once the meeting is held.
      const start = new Date(meeting.start);
      const uploadedBefore = (days: number) =>
        localDateTime(new Date(start.getTime() - days * 24 * 60 * 60 * 1000 - Math.floor(random() * 3600_000)));
      const uploader = secretary?.name ?? CURRENT_USER;
      const add = (name: string, size: number, uploaded: string, user = uploader) => {
        documents.push({ id: id('d'), meetingId: meeting.id, name, type: typeOf(name), size, user, uploaded });
      };

      add('Invitation and agenda.pdf', 80_000 + Math.floor(random() * 60_000), uploadedBefore(14));

      if (topics.length > 0 && meeting.status !== 'Cancelled') {
        add('Board pack.pdf', 2_000_000 + Math.floor(random() * 6_000_000), uploadedBefore(7));

        for (const topic of topics.slice(0, 2)) {
          add(`${topic}.pptx`, 900_000 + Math.floor(random() * 4_000_000), uploadedBefore(3), pick(members).name);
        }
      }

      if (recorded) {
        add(
          meeting.minutesApproved ? 'Minutes.pdf' : 'Minutes (draft).docx',
          40_000 + Math.floor(random() * 50_000),
          uploadedBefore(-5),
        );
      }
    }

    meetings.push(...boardMeetings);
  }

  return { boards, people, memberships, meetings, agendaItems, agendaSections, documents };
}

// The extension in capitals, or `FILE` for a name without one.
function typeOf(name: string): string {
  const dot = name.lastIndexOf('.');

  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toUpperCase() : 'FILE';
}

const db = createStore<Db>()(() => seedDb());

let nextId = 10_000;

const newId = (prefix: string) => `${prefix}${nextId++}`;

// ---------------------------------------------------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------------------------------------------------

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

// The filters of the columns: a select filter is a list (one of), a text filter `{ text, match }`, a date range
// `{ from, to }` (yyyy-mm-dd, both inclusive).
function oneOf(value: string, filter: unknown): boolean {
  return !Array.isArray(filter) || filter.length === 0 || filter.includes(value);
}

function within(date: string, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { from, to } = filter as { from?: unknown; to?: unknown };
  const day = date.slice(0, 10);

  return (typeof from !== 'string' || day >= from) && (typeof to !== 'string' || day <= to);
}

function matches(value: string, filter: unknown): boolean {
  if (filter === null || typeof filter !== 'object' || Array.isArray(filter)) {
    return true;
  }

  const { text, match } = filter as { text?: unknown; match?: unknown };

  if (typeof text !== 'string') {
    return true;
  }

  const [haystack, needle] = [value.toLowerCase(), text.toLowerCase()];

  return match === 'startsWith'
    ? haystack.startsWith(needle)
    : match === 'endsWith'
    ? haystack.endsWith(needle)
    : haystack.includes(needle);
}

type QueryOptions<Row> = {
  // The fields the search looks in.
  search: readonly (keyof Row & string)[];
  // One predicate per filterable column, called with the column's filter value.
  filters?: Partial<Record<string, (row: Row, value: unknown) => boolean>>;
};

// Search, column filters, sorting and paging, the same for every table.
function runQuery<Row>(
  rows: readonly Row[],
  query: DataNavigatorComponent.Query,
  options: QueryOptions<Row>,
): DataNavigatorComponent.Result<Row> {
  const text = query.search.toLowerCase();
  const filtered = rows
    .filter((row) =>
      Object.entries(query.filters).every(([key, value]) => options.filters?.[key]?.(row, value) ?? true)
    )
    .filter((row) => text === '' || options.search.some((key) => String(row[key] ?? '').toLowerCase().includes(text)));

  if (query.sort) {
    const key = query.sort.key as keyof Row;
    const factor = query.sort.direction === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      const [left, right] = [a[key], b[key]];

      return factor * (typeof left === 'number' && typeof right === 'number'
        ? left - right
        : String(left ?? '').localeCompare(String(right ?? ''), 'en', { numeric: true }));
    });
  }

  const { page, pageSize } = query;

  return { rows: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length };
}

// Lookups, for the pages (e.g. the breadcrumb). They read the current state, so they also work outside React.
function getBoard(state: Pick<Db, 'boards'>, id: string | undefined): Board | undefined {
  return state.boards.find((board) => board.id === id);
}

function getMeeting(state: Pick<Db, 'meetings'>, id: string | undefined): Meeting | undefined {
  return state.meetings.find((meeting) => meeting.id === id);
}

function getPerson(state: Pick<Db, 'people'>, id: string | undefined): Person | undefined {
  return state.people.find((person) => person.id === id);
}

function boardRows(state: Db): BoardRow[] {
  const today = localDateTime(new Date());

  return state.boards.map((board) => {
    const memberships = state.memberships.filter((membership) => membership.boardId === board.id);
    const chair = memberships.find((membership) => membership.role === 'Chair');
    const meetings = state.meetings.filter((meeting) => meeting.boardId === board.id);
    const next = meetings
      .filter((meeting) => meeting.status === 'Planned' && meeting.start >= today)
      .sort((a, b) => a.start.localeCompare(b.start))[0];

    return {
      ...board,
      chair: getPerson(state, chair?.personId)?.name ?? '',
      members: memberships.length,
      meetings: meetings.length,
      nextMeeting: next?.start ?? '',
    };
  });
}

async function fetchBoards(
  query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<BoardRow>> {
  await wait(LOADING_TIME, signal);

  return runQuery(boardRows(db.getState()), query, {
    search: ['name', 'description', 'chair'],
    filters: {
      name: (row, value) => matches(row.name, value),
      chair: (row, value) => matches(row.chair, value),
      nextMeeting: (row, value) => within(row.nextMeeting, value),
    },
  });
}

function meetingRows(state: Db): MeetingRow[] {
  return state.meetings.map((meeting) => ({
    ...meeting,
    board: getBoard(state, meeting.boardId)?.name ?? '',
    items: state.agendaItems.filter((item) => item.meetingId === meeting.id).length,
    documents: state.documents.filter((document) => document.meetingId === meeting.id).length,
  }));
}

// The meetings of one board, or of all boards (`boardId` undefined).
function fetchMeetings(boardId?: string): DataNavigatorComponent.Source<MeetingRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const rows = meetingRows(db.getState()).filter((row) => boardId === undefined || row.boardId === boardId);

    return runQuery(rows, query, {
      search: ['title', 'board', 'location', 'status'],
      filters: {
        title: (row, value) => matches(row.title, value),
        board: (row, value) => oneOf(row.board, value),
        status: (row, value) => oneOf(row.status, value),
        start: (row, value) => within(row.start, value),
      },
    });
  };
}

// The items as rows, in the order of the agenda, and the sections as groups (the key is the section's id) with their
// totals, then "Other" (`''`, only with items). One page holds the whole agenda (no search, no filters). An empty
// section is a group with `total: 0`, so the table shows it.
function fetchAgenda(meetingId: string): DataNavigatorComponent.Source<AgendaRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const state = db.getState();
    const agenda = agendaOf(state, meetingId);
    const numbers = agendaNumbers(agenda);
    const rows = agenda.flatMap((entry): AgendaRow[] =>
      entry.type === 'section' ? [] : [{
        ...entry.item,
        number: numbers.get(entry.item.id) ?? '',
        presenter: getPerson(state, entry.item.presenterId)?.name ?? '',
        recorded: entry.item.minutes === '' && entry.item.decision === '' ? 'No' : 'Yes',
      }]
    );
    const totalOf = (key: string) => rows.filter((row) => row.sectionId === key).length;
    const groups = [
      ...agenda.flatMap((entry) => (entry.type === 'section' ? [entry.section.id] : [])),
      '',
    ]
      .map((key): DataNavigatorComponent.ResultGroup => ({ key, total: totalOf(key) }))
      // "Other" only with items.
      .filter((group) => group.total > 0 || group.key !== '');

    return { ...runQuery(rows, query, { search: [] }), groups };
  };
}

function fetchDocuments(meetingId: string): DataNavigatorComponent.Source<MeetingDocument> {
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

function fetchBoardMembers(boardId: string): DataNavigatorComponent.Source<MemberRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const state = db.getState();
    const rows = state.memberships
      .filter((membership) => membership.boardId === boardId)
      // Chair first, then vice chair, secretary, members (the table's order without a sort).
      .sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
      .map((membership): MemberRow => {
        const person = getPerson(state, membership.personId);

        return {
          ...membership,
          name: person?.name ?? '',
          email: person?.email ?? '',
          organization: person?.organization ?? '',
        };
      });

    return runQuery(rows, query, {
      search: ['name', 'email', 'organization', 'role'],
      filters: {
        name: (row, value) => matches(row.name, value),
        role: (row, value) => oneOf(row.role, value),
        organization: (row, value) => matches(row.organization, value),
        since: (row, value) => within(row.since, value),
      },
    });
  };
}

async function fetchPeople(
  query: DataNavigatorComponent.Query,
  signal: AbortSignal,
): Promise<DataNavigatorComponent.Result<PersonRow>> {
  await wait(LOADING_TIME, signal);

  const state = db.getState();
  const rows = state.people.map((person): PersonRow => {
    const memberships = state.memberships.filter((membership) => membership.personId === person.id);

    return {
      ...person,
      boardIds: memberships.map((membership) => membership.boardId),
      boards: memberships.map((membership) => getBoard(state, membership.boardId)?.name ?? '').join(', '),
      roles: [...new Set(memberships.map((membership) => membership.role))].join(', '),
    };
  });

  return runQuery(rows, query, {
    search: ['name', 'email', 'organization', 'boards'],
    filters: {
      organization: (row, value) => oneOf(row.organization, value),
      boards: (row, value) =>
        !Array.isArray(value) || value.length === 0
        || row.boardIds.some((boardId) => value.includes(getBoard(state, boardId)?.name)),
    },
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// Changes
// ---------------------------------------------------------------------------------------------------------------------

async function save(change: (state: Db) => Partial<Db>): Promise<void> {
  await wait(SAVE_TIME);
  db.setState(change);
}

async function createBoard(values: Pick<Board, 'name' | 'description'>): Promise<Board> {
  const board: Board = { id: newId('b'), ...values };

  await save((state) => ({ boards: [...state.boards, board] }));

  return board;
}

async function updateBoard(id: string, values: Pick<Board, 'name' | 'description'>): Promise<void> {
  await save((state) => ({ boards: state.boards.map((board) => (board.id === id ? { ...board, ...values } : board)) }));
}

// Deletes the boards with everything that belongs to them: meetings, agendas, documents, memberships.
async function deleteBoards(ids: readonly string[]): Promise<void> {
  await save((state) => {
    const meetingIds = new Set(state.meetings.filter((meeting) => ids.includes(meeting.boardId)).map((m) => m.id));

    return {
      boards: state.boards.filter((board) => !ids.includes(board.id)),
      memberships: state.memberships.filter((membership) => !ids.includes(membership.boardId)),
      meetings: state.meetings.filter((meeting) => !meetingIds.has(meeting.id)),
      agendaItems: state.agendaItems.filter((item) => !meetingIds.has(item.meetingId)),
      agendaSections: state.agendaSections.filter((section) => !meetingIds.has(section.meetingId)),
      documents: state.documents.filter((document) => !meetingIds.has(document.meetingId)),
    };
  });
}

type PersonValues = Pick<Person, 'name' | 'email' | 'organization'>;

async function createPerson(values: PersonValues): Promise<void> {
  const person: Person = { id: newId('p'), ...values };

  await save((state) => ({ people: [...state.people, person] }));
}

async function updatePerson(id: string, values: PersonValues): Promise<void> {
  await save((state) => ({
    people: state.people.map((person) => (person.id === id ? { ...person, ...values } : person)),
  }));
}

// Deletes the people with their memberships. The agenda items they present keep no presenter.
async function deletePeople(ids: readonly string[]): Promise<void> {
  await save((state) => ({
    people: state.people.filter((person) => !ids.includes(person.id)),
    memberships: state.memberships.filter((membership) => !ids.includes(membership.personId)),
    agendaItems: state.agendaItems.map((
      item,
    ) => (ids.includes(item.presenterId) ? { ...item, presenterId: '' } : item)),
  }));
}

async function addMember(boardId: string, personId: string, role: Role): Promise<void> {
  const membership: Membership = { id: newId('ms'), boardId, personId, role, since: localDate(new Date()) };

  await save((state) => ({ memberships: [...state.memberships, membership] }));
}

async function changeRole(id: string, role: Role): Promise<void> {
  await save((state) => ({
    memberships: state.memberships.map((membership) => (membership.id === id ? { ...membership, role } : membership)),
  }));
}

async function removeMembers(ids: readonly string[]): Promise<void> {
  await save((state) => ({ memberships: state.memberships.filter((membership) => !ids.includes(membership.id)) }));
}

type MeetingValues = Pick<Meeting, 'title' | 'start' | 'location'>;

// A new meeting gets the two standard items and "Any other business", presented by the board's chair.
async function createMeeting(boardId: string, values: MeetingValues): Promise<Meeting> {
  const meeting: Meeting = { id: newId('m'), boardId, ...values, status: 'Planned', minutesApproved: false };

  await save((state) => {
    const chair = state.memberships.find((membership) => membership.boardId === boardId && membership.role === 'Chair');
    const item = (position: number, title: string, duration: number): AgendaItem => ({
      id: newId('a'),
      meetingId: meeting.id,
      position,
      sectionId: '',
      title,
      presenterId: chair?.personId ?? '',
      duration,
      description: '',
      minutes: '',
      decision: '',
    });

    return {
      meetings: [...state.meetings, meeting],
      agendaItems: [
        ...state.agendaItems,
        item(1, 'Opening and adoption of the agenda', 5),
        item(2, 'Approval of the minutes of the last meeting', 5),
        item(3, 'Any other business', 10),
      ],
    };
  });

  return meeting;
}

async function updateMeeting(id: string, values: MeetingValues): Promise<void> {
  await save((state) => ({
    meetings: state.meetings.map((meeting) => (meeting.id === id ? { ...meeting, ...values } : meeting)),
  }));
}

async function setMeetingStatus(id: string, status: MeetingStatus): Promise<void> {
  await save((state) => ({
    meetings: state.meetings.map((meeting) => (meeting.id === id ? { ...meeting, status } : meeting)),
  }));
}

async function approveMinutes(id: string): Promise<void> {
  await save((state) => ({
    meetings: state.meetings.map((meeting) => (meeting.id === id ? { ...meeting, minutesApproved: true } : meeting)),
  }));
}

async function deleteMeetings(ids: readonly string[]): Promise<void> {
  await save((state) => ({
    meetings: state.meetings.filter((meeting) => !ids.includes(meeting.id)),
    agendaItems: state.agendaItems.filter((item) => !ids.includes(item.meetingId)),
    agendaSections: state.agendaSections.filter((section) => !ids.includes(section.meetingId)),
    documents: state.documents.filter((document) => !ids.includes(document.meetingId)),
  }));
}

type AgendaValues = Pick<AgendaItem, 'sectionId' | 'title' | 'presenterId' | 'duration' | 'description'>;

// An agenda in its order: sections and items.
type AgendaEntry = { type: 'section'; section: AgendaSection } | { type: 'item'; item: AgendaItem };

const idOf = (entry: AgendaEntry) => (entry.type === 'section' ? entry.section.id : entry.item.id);

// The group of an entry: a section is its own, an item is in its section's (or in none, `''`).
const groupOf = (entry: AgendaEntry | undefined) =>
  entry === undefined ? '' : entry.type === 'section' ? entry.section.id : entry.item.sectionId;

// The agenda of a meeting, arranged.
function agendaOf(state: Pick<Db, 'agendaItems' | 'agendaSections'>, meetingId: string): AgendaEntry[] {
  return arranged([
    ...state.agendaSections
      .filter((section) => section.meetingId === meetingId)
      .map((section): AgendaEntry => ({ type: 'section', section })),
    ...state.agendaItems.filter((item) => item.meetingId === meetingId).map((item): AgendaEntry => ({
      type: 'item',
      item,
    })),
  ].sort((a, b) =>
    (a.type === 'section' ? a.section : a.item).position - (b.type === 'section' ? b.section : b.item).position
  ));
}

// The sections, each followed by its items, then the items without a section ("Other" in the table); an item whose
// section is gone has none. Without sections, only the items (a flat agenda).
function arranged(entries: readonly AgendaEntry[]): AgendaEntry[] {
  const sections = new Set(entries.flatMap((entry) => (entry.type === 'section' ? [entry.section.id] : [])));
  const fixed = entries.map((entry): AgendaEntry =>
    entry.type === 'item' && entry.item.sectionId !== '' && !sections.has(entry.item.sectionId)
      ? { type: 'item', item: { ...entry.item, sectionId: '' } }
      : entry
  );
  const itemsOf = (sectionId: string) =>
    fixed.filter((entry) => entry.type === 'item' && entry.item.sectionId === sectionId);

  return [
    ...fixed.flatMap((entry) => (entry.type === 'section' ? [entry, ...itemsOf(entry.section.id)] : [])),
    ...itemsOf(''),
  ];
}

// The new state of a meeting's agenda: arranged, and the positions numbered again (1, 2, 3, ...).
function withAgenda(state: Db, meetingId: string, entries: readonly AgendaEntry[]): Partial<Db> {
  const order = arranged(entries);
  const position = (id: string) => order.findIndex((entry) => idOf(entry) === id) + 1;

  return {
    agendaItems: [
      ...state.agendaItems.filter((item) => item.meetingId !== meetingId),
      ...order.flatMap((
        entry,
      ) => (entry.type === 'item' ? [{ ...entry.item, position: position(entry.item.id) }] : [])),
    ],
    agendaSections: [
      ...state.agendaSections.filter((section) => section.meetingId !== meetingId),
      ...order.flatMap((entry) =>
        entry.type === 'section' ? [{ ...entry.section, position: position(entry.section.id) }] : []
      ),
    ],
  };
}

// The numbers of an agenda (arranged), by id. A flat agenda: `1`, `2`, ... With sections: `2` for a section (also an
// empty one) and `2.1` for its items; the items without a section are the last one, "Other" (its number under the key
// `''`).
function agendaNumbers(agenda: readonly AgendaEntry[]): Map<string, string> {
  const numbers = new Map<string, string>();
  const flat = !agenda.some((entry) => entry.type === 'section');
  let top = 0;
  let sub = 0;

  for (const entry of agenda) {
    if (entry.type === 'section') {
      top += 1;
      sub = 0;
      numbers.set(entry.section.id, String(top));
    } else if (flat) {
      numbers.set(entry.item.id, String(++top));
    } else {
      if (entry.item.sectionId === '' && !numbers.has('')) {
        top += 1;
        sub = 0;
        numbers.set('', String(top));
      }

      numbers.set(entry.item.id, `${top}.${++sub}`);
    }
  }

  return numbers;
}

// The index after the block of the entry at `index`: a section with its items, or an item without a section.
function blockEnd(agenda: readonly AgendaEntry[], index: number): number {
  const group = groupOf(agenda[index]);

  return group === '' ? index + 1 : agenda.findLastIndex((entry) => groupOf(entry) === group) + 1;
}

// Where something new without a section goes: before "Any other business" (if the agenda ends with it), else at the end.
function newPlace(agenda: readonly AgendaEntry[]): number {
  const last = agenda.at(-1);

  return last?.type === 'item' && last.item.sectionId === '' && last.item.title === 'Any other business'
    ? agenda.length - 1
    : agenda.length;
}

// An item in a section goes to the end of it; one without a section before "Any other business".
async function createAgendaItem(meetingId: string, values: AgendaValues): Promise<void> {
  await save((state) => {
    const agenda = agendaOf(state, meetingId);
    const item: AgendaItem = { id: newId('a'), meetingId, position: 0, ...values, minutes: '', decision: '' };
    const section = agenda.findIndex((entry) => entry.type === 'section' && entry.section.id === values.sectionId);
    const index = section >= 0 ? blockEnd(agenda, section) : newPlace(agenda);

    return withAgenda(state, meetingId, agenda.toSpliced(index, 0, { type: 'item', item }));
  });
}

// Another section: the item goes to the end of it. Out of its section (`sectionId: ''`): to "Other", before "Any other
// business" (else at the end).
async function updateAgendaItem(id: string, values: Partial<Omit<AgendaItem, 'id' | 'meetingId'>>): Promise<void> {
  await save((state) => {
    const current = state.agendaItems.find((item) => item.id === id);

    if (current === undefined) {
      return {};
    }

    const changed = { ...current, ...values };

    if (changed.sectionId === current.sectionId) {
      return { agendaItems: state.agendaItems.map((item) => (item.id === id ? changed : item)) };
    }

    const rest = agendaOf(state, current.meetingId).filter((entry) => idOf(entry) !== id);
    const anchor = rest.findIndex((entry) => entry.type === 'section' && entry.section.id === changed.sectionId);
    const index = changed.sectionId !== '' && anchor >= 0 ? blockEnd(rest, anchor) : newPlace(rest);

    return withAgenda(state, current.meetingId, rest.toSpliced(index, 0, { type: 'item', item: changed }));
  });
}

async function deleteAgendaItems(ids: readonly string[]): Promise<void> {
  await save((state) => {
    const meetingId = state.agendaItems.find((item) => ids.includes(item.id))?.meetingId ?? '';

    return withAgenda(state, meetingId, agendaOf(state, meetingId).filter((entry) => !ids.includes(idOf(entry))));
  });
}

// A move of the agenda table (`reorder`): the item joins `move.group` (a section, or none) and goes after `move.after`
// (a row on the page), or before `move.before`. In a section, it is placed among that section's items (at its start
// when neither neighbor is in it). Saved at once (no spinner to show).
async function reorderAgenda(move: DataNavigatorComponent.Move<AgendaRow>): Promise<void> {
  await wait(LOADING_TIME);

  const { meetingId } = move.row;

  db.setState((state) => {
    const rest = agendaOf(state, meetingId).filter((entry) => idOf(entry) !== move.row.id);
    const item = state.agendaItems.find((other) => other.id === move.row.id);

    if (item === undefined) {
      return {};
    }

    const moved: AgendaEntry = { type: 'item', item: { ...item, sectionId: move.group ?? '' } };
    const indexOf = (row: AgendaRow | undefined) =>
      rest.findIndex((entry) => row !== undefined && idOf(entry) === row.id);
    const inSection = (row: AgendaRow | undefined) => row !== undefined && row.sectionId === move.group;
    const header = rest.findIndex((entry) => entry.type === 'section' && entry.section.id === move.group);
    const index = move.group !== undefined
      ? inSection(move.after)
        ? indexOf(move.after) + 1
        : inSection(move.before)
        ? indexOf(move.before)
        : header >= 0
        ? header + 1
        : rest.length
      : move.after !== undefined
      ? blockEnd(rest, indexOf(move.after))
      : move.before !== undefined
      ? indexOf(move.before)
      : 0;

    return withAgenda(state, meetingId, rest.toSpliced(Math.max(0, index), 0, moved));
  });
}

const newSectionId = () => newId('s');

// A draft of the sections (the "Sections" drawer) applied to a meeting's agenda: the sections of the draft, in its order
// and with its names, each with its items. A section that is missing from the draft is deleted; its items go to
// "Other", at its start (before the items that were there already).
function withSectionDraft(state: Db, meetingId: string, draft: SectionDraft): Partial<Db> {
  const items = agendaOf(state, meetingId).filter((entry) => entry.type === 'item');
  const sections = draft.map((section): AgendaEntry => ({
    type: 'section',
    section: { id: section.id, meetingId, position: 0, title: section.title },
  }));

  return withAgenda(state, meetingId, [...sections, ...items]);
}

// "Apply" of the "Sections" drawer: the whole draft at once.
async function saveSectionDraft(meetingId: string, draft: SectionDraft): Promise<void> {
  await save((state) => withSectionDraft(state, meetingId, draft));
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

async function deleteDocuments(ids: readonly string[]): Promise<void> {
  await save((state) => ({ documents: state.documents.filter((document) => !ids.includes(document.id)) }));
}
