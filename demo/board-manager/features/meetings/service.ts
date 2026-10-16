import { agendaOf, ROLES } from '../../domain/index.js';
import type {
  AgendaEntry,
  AgendaRepository,
  BoardRepository,
  DocumentRepository,
  MeetingDocument,
  MeetingRepository,
  MeetingSummary,
  MembershipRepository,
  Person,
  PersonRepository,
  Role,
} from '../../domain/index.js';

export { createMeetingService };
export type { MeetingReportData, MeetingService };

// What the report of a meeting (its PDF) shows: the meeting, its agenda, the attendees (the board's members by role)
// and the documents; `people` for the names of the presenters and of the mentions in the minutes.
type MeetingReportData = {
  meeting: MeetingSummary;
  agenda: readonly AgendaEntry[];
  attendees: readonly { name: string; role: Role }[];
  documents: readonly MeetingDocument[];
  people: readonly Person[];
};

// What the meetings feature's UI calls: the meetings, their agendas and documents, the board's members (the
// presenters), and the report.
type MeetingService = ReturnType<typeof createMeetingService>;

function createMeetingService(
  { meetings, agenda, documents, boards, memberships, people }: {
    meetings: MeetingRepository;
    agenda: AgendaRepository;
    documents: DocumentRepository;
    boards: BoardRepository;
    memberships: MembershipRepository;
    people: PersonRepository;
  },
) {
  // The members of a board, as people, by their role (chair first).
  async function members(boardId: string, signal?: AbortSignal): Promise<readonly Person[]> {
    const [all, list] = await Promise.all([people.all(signal), memberships.all(signal)]);

    return list
      .filter((membership) => membership.boardId === boardId)
      .toSorted((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
      .flatMap((membership) => all.find((person) => person.id === membership.personId) ?? []);
  }

  return {
    ...meetings,
    boards: boards.all,
    people: people.all,
    members,
    agenda: agenda.agenda,
    createItem: agenda.createItem,
    updateItem: agenda.updateItem,
    deleteItems: agenda.deleteItems,
    moveItem: agenda.move,
    saveSections: agenda.saveSections,
    findDocuments: documents.find,
    uploadDocument: documents.upload,
    commitDocuments: documents.commit,
    discardDocuments: documents.discard,
    renameDocument: documents.rename,
    deleteDocuments: documents.delete,

    async report(meetingId: string): Promise<MeetingReportData | undefined> {
      const meeting = await meetings.get(meetingId);

      if (meeting === undefined) {
        return undefined;
      }

      const [{ items, sections }, list, all, files] = await Promise.all([
        agenda.agenda(meetingId),
        memberships.all(),
        people.all(),
        documents.all(meetingId),
      ]);
      const attendees = list
        .filter((membership) => membership.boardId === meeting.boardId)
        .toSorted((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
        .flatMap((membership) => {
          const person = all.find((candidate) => candidate.id === membership.personId);

          return person === undefined ? [] : [{ name: person.name, role: membership.role }];
        });

      return {
        meeting,
        agenda: agendaOf({ agendaItems: items, agendaSections: sections }, meetingId),
        attendees,
        documents: files,
        people: all,
      };
    },
  };
}
