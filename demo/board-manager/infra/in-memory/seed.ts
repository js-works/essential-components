import { ROLES } from '../../domain';
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
import { CURRENT_USER, localDate, localDateTime, typeOf } from './helpers';
import type { Db } from './store';

export { seedDb };

// The seed: made up but stable (a seeded random generator), with dates relative to today.

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

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

// A person and the name of their organization (`''`: none, an independent member).
const PEOPLE: readonly (readonly [string, string])[] = [
  ['Helena Brandt', 'Brandt Holding'],
  ['Markus Weller', 'Company'],
  ['Sofia Lindqvist', 'Nordic Capital Partners'],
  ['Jonas Albrecht', 'Company'],
  ['Amira Haddad', 'Haddad & Partner Law'],
  ['Thomas Keller', 'Company'],
  ['Claire Dubois', ''],
  ['Viktor Horvath', 'Works Council'],
  ['Mei-Ling Chen', 'Company'],
  ['Daniel Fischer', 'Company'],
  ['Laura Moreno', ''],
  ['Peter Novak', 'Works Council'],
  ['Anna Schröder', 'Company'],
  ['Omar Farouk', 'Gulf Invest'],
  ['Katharina Wolf', 'Company'],
  ['Lukas Berger', 'Works Council'],
  ['Isabel Costa', ''],
  ['Felix Hartmann', 'Company'],
  ['Nadia Petrova', 'Works Council'],
  ['Ben Carter', 'Carter Advisory'],
  ['Julia Richter', 'Company'],
  ['Hannes Vogel', 'Works Council'],
  ['Lea Zimmermann', 'Company'],
  ['Martin Kovács', 'Works Council'],
  ['Sarah Klein', ''],
  ['Wei Zhang', 'Company'],
  ['Elena Popescu', 'Works Council'],
  ['Robert Stein', 'Stein Family Office'],
];

// The organizations of the people (by name), without the id. Not random: the random seed of the rest stays the same.
const ORGANIZATIONS: readonly Omit<Organization, 'id'>[] = [
  {
    name: 'Company',
    description: 'The company itself: its managers and employees.',
    street: 'Industriestraße 12',
    zipCode: '70565',
    city: 'Stuttgart',
    country: 'DE',
    website: 'https://www.company.example',
  },
  {
    name: 'Works Council',
    description: 'The elected representatives of the employees.',
    street: 'Industriestraße 12',
    zipCode: '70565',
    city: 'Stuttgart',
    country: 'DE',
    website: '',
  },
  {
    name: 'Brandt Holding',
    description: 'The main shareholder.',
    street: 'Königstraße 28',
    zipCode: '70173',
    city: 'Stuttgart',
    country: 'DE',
    website: 'https://www.brandt-holding.example',
  },
  {
    name: 'Nordic Capital Partners',
    description: 'A private equity investor, with a minority stake.',
    street: 'Strandvägen 7A',
    zipCode: '114 56',
    city: 'Stockholm',
    country: 'SE',
    website: 'https://www.nordic-capital.example',
  },
  {
    name: 'Haddad & Partner Law',
    description: 'A law firm, the legal advisor of the Supervisory Board.',
    street: 'Bockenheimer Landstraße 51',
    zipCode: '60325',
    city: 'Frankfurt am Main',
    country: 'DE',
    website: 'https://www.haddad-law.example',
  },
  {
    name: 'Gulf Invest',
    description: 'A sovereign wealth fund, a shareholder since the last capital increase.',
    street: '',
    zipCode: '',
    city: 'Dubai',
    country: 'AE',
    website: 'https://www.gulf-invest.example',
  },
  {
    name: 'Carter Advisory',
    description: '',
    street: '',
    zipCode: '',
    city: 'London',
    country: 'GB',
    website: '',
  },
  {
    name: 'Stein Family Office',
    description: 'The office of the founding family.',
    street: 'Bahnhofstrasse 45',
    zipCode: '8001',
    city: 'Zürich',
    country: 'CH',
    website: 'https://www.stein-family-office.example',
  },
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
  // The organizations have ids of their own (`o1`, ...), so the ids of everything else do not change with them.
  const organizations: Organization[] = ORGANIZATIONS.map((seed, index) => ({ id: `o${index + 1}`, ...seed }));
  const people: Person[] = PEOPLE.map(([name, organization]) => ({
    id: id('p'),
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, '.')}@example.com`,
    organizationId: organizations.find((candidate) => candidate.name === organization)?.id ?? '',
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

  return { boards, organizations, people, memberships, meetings, agendaItems, agendaSections, documents };
}
