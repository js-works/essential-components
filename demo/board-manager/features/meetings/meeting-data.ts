import type {
  AgendaEntry,
  AgendaRepository,
  AgendaSection,
  BoardRepository,
  DocumentRepository,
  MeetingRepository,
  MembershipRepository,
  Person,
  PersonRepository,
} from '../../domain/index.js';
import { agendaOf, ROLES } from '../../domain/index.js';
import { useRead, useRecord } from '../../shared/lib/queries.js';
import { createServiceContext } from '../../shared/lib/service-context.js';
import { withChanges } from '../../shared/lib/with-changes.js';

export type { MeetingService };
export {
  createMeetingService,
  MeetingServiceContext,
  useAgenda,
  useBoardMembers,
  useMeeting,
  useMeetingList,
  useMeetingService,
};

// What the meetings' UI calls: the meetings, their agendas and documents, the board's members (the
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

const [MeetingServiceContext, useMeetingService] = createServiceContext<MeetingService>('MeetingService');

// One meeting with its board's name and its numbers.
function useMeeting(meetingId: string) {
  const service = useMeetingService();
  const { record, isPending } = useRecord(
    ['meetings', 'detail', meetingId],
    (signal) => service.get(meetingId, signal),
  );

  return { meeting: record, isPending };
}

// All meetings (`[]` while they load).
function useMeetingList() {
  const service = useMeetingService();

  return useRead(['meetings', 'list'], (signal) => service.all(signal)) ?? [];
}

// A meeting's agenda, arranged (`entries`), with its sections in their order (both `[]` while it loads).
function useAgenda(meetingId: string): { entries: readonly AgendaEntry[]; sections: readonly AgendaSection[] } {
  const service = useMeetingService();
  const agenda = useRead(['meetings', 'agenda', meetingId], async (signal) => {
    const { items, sections } = await service.agenda(meetingId, signal);

    return agendaOf({ agendaItems: items, agendaSections: sections }, meetingId);
  }) ?? [];

  return {
    entries: agenda,
    sections: agenda.flatMap((entry) => (entry.type === 'section' ? [entry.section] : [])),
  };
}

// The members of a board, as people (the presenters of its meetings' items), `[]` while they load.
function useBoardMembers(boardId: string) {
  const service = useMeetingService();

  return useRead(['meetings', 'members', boardId], (signal) => service.members(boardId, signal)) ?? [];
}
