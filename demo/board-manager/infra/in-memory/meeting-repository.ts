import type { AgendaItem, Meeting, MeetingRepository, MeetingSummary } from '../../domain/index.js';
import { boardIdsOf, getBoard } from './lookups.js';
import { containsText, inList, inRange, matchesText, pageOf, sorted } from './query.js';
import { db, LOADING_TIME, newId, save, wait } from './store.js';
import type { Db } from './store.js';

export { createMeetingRepository };

// The meetings with their board's name and the numbers of their agenda items and documents.
function summaries(state: Db, meetings: readonly Meeting[] = state.meetings): MeetingSummary[] {
  return meetings.map((meeting) => ({
    ...meeting,
    board: getBoard(state, meeting.boardId)?.name ?? '',
    items: state.agendaItems.filter((item) => item.meetingId === meeting.id).length,
    documents: state.documents.filter((document) => document.meetingId === meeting.id).length,
  }));
}

// The meetings of the in-memory store.
function createMeetingRepository(): MeetingRepository {
  return {
    async find(criteria, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();
      const boardIds = criteria.personId === undefined ? undefined : boardIdsOf(state, criteria.personId);
      const found = summaries(state).filter((meeting) =>
        (criteria.boardId === undefined || meeting.boardId === criteria.boardId)
        && (boardIds === undefined || boardIds.includes(meeting.boardId))
        && containsText([meeting.title, meeting.board, meeting.location, meeting.status], criteria.text)
        && matchesText(meeting.title, criteria.title)
        && matchesText(meeting.location, criteria.location)
        && inList(meeting.board, criteria.boards)
        && inList(meeting.status, criteria.statuses)
        && (criteria.minutes === undefined || criteria.minutes.length === 0
          || (meeting.status === 'Held' && criteria.minutes.includes(meeting.minutesApproved ? 'approved' : 'draft')))
        && inRange(meeting.start, criteria.start)
      );

      return pageOf(sorted(found, sort), paging);
    },

    async get(id, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();

      return summaries(state, state.meetings.filter((meeting) => meeting.id === id))[0];
    },

    async all(signal) {
      await wait(LOADING_TIME, signal);

      return db.getState().meetings;
    },

    async create(boardId, values) {
      const meeting: Meeting = { id: newId('m'), boardId, ...values, status: 'Planned', minutesApproved: false };

      await save((state) => {
        const chair = state.memberships.find((membership) =>
          membership.boardId === boardId && membership.role === 'Chair'
        );
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
    },

    async update(id, values) {
      await save((state) => ({
        meetings: state.meetings.map((meeting) => (meeting.id === id ? { ...meeting, ...values } : meeting)),
      }));
    },

    async setStatus(id, status) {
      await save((state) => ({
        meetings: state.meetings.map((meeting) => (meeting.id === id ? { ...meeting, status } : meeting)),
      }));
    },

    async approveMinutes(id) {
      await save((state) => ({
        meetings: state.meetings.map((
          meeting,
        ) => (meeting.id === id ? { ...meeting, minutesApproved: true } : meeting)),
      }));
    },

    async delete(ids) {
      await save((state) => ({
        meetings: state.meetings.filter((meeting) => !ids.includes(meeting.id)),
        agendaItems: state.agendaItems.filter((item) => !ids.includes(item.meetingId)),
        agendaSections: state.agendaSections.filter((section) => !ids.includes(section.meetingId)),
        documents: state.documents.filter((document) => !ids.includes(document.meetingId)),
      }));
    },
  };
}
