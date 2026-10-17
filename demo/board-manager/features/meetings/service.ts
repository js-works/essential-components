import type {
  AgendaRepository,
  BoardRepository,
  DocumentRepository,
  MeetingRepository,
  MembershipRepository,
  Person,
  PersonRepository,
} from '../../domain/index.js';
import { ROLES } from '../../domain/index.js';
import { withChanges } from '../../shared/lib/with-changes.js';

export type { MeetingService };
export { createMeetingService };

// What the meetings feature's UI calls: the meetings, their agendas and documents, the board's members (the
// presenters). After a change, `onChange`.
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
  onChange: () => void,
) {
  // The members of a board, as people, by their role (chair first).
  async function members(boardId: string, signal?: AbortSignal): Promise<readonly Person[]> {
    const [all, list] = await Promise.all([people.all(signal), memberships.all(signal)]);

    return list
      .filter((membership) => membership.boardId === boardId)
      .toSorted((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role))
      .flatMap((membership) => all.find((person) => person.id === membership.personId) ?? []);
  }

  const service = {
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
  };

  return withChanges(
    service,
    [
      'create',
      'update',
      'setStatus',
      'approveMinutes',
      'delete',
      'createItem',
      'updateItem',
      'deleteItems',
      'moveItem',
      'saveSections',
      'commitDocuments',
      'renameDocument',
      'deleteDocuments',
    ],
    onChange,
  );
}
