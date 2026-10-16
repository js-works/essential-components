import { agendaOf } from '../../domain/index.js';
import type { AgendaEntry, AgendaSection } from '../../domain/index.js';
import { useRead, useRecord } from '../../shared/lib/queries.js';
import { useMeetingService } from './context.js';
import { meetingKeys } from './keys.js';

export { useAgenda, useBoardMembers, useMeeting, useMeetingList };

// One meeting with its board's name and its numbers.
function useMeeting(meetingId: string) {
  const service = useMeetingService();
  const { record, isPending } = useRecord(meetingKeys.detail(meetingId), (signal) => service.get(meetingId, signal));

  return { meeting: record, isPending };
}

// All meetings (`[]` while they load).
function useMeetingList() {
  const service = useMeetingService();

  return useRead(meetingKeys.list(), (signal) => service.all(signal)) ?? [];
}

// A meeting's agenda, arranged (`entries`), with its sections in their order (both `[]` while it loads).
function useAgenda(meetingId: string): { entries: readonly AgendaEntry[]; sections: readonly AgendaSection[] } {
  const service = useMeetingService();
  const agenda = useRead(meetingKeys.agenda(meetingId), async (signal) => {
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

  return useRead(meetingKeys.members(boardId), (signal) => service.members(boardId, signal)) ?? [];
}
