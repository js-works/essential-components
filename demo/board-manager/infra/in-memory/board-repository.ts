import type { Board, BoardRepository, BoardSummary } from '../../domain/index.js';
import { localDateTime } from '../../domain/index.js';
import { getPerson } from './lookups.js';
import { containsText, inList, inRange, matchesText, pageOf, sorted } from './query.js';
import type { Db } from './store.js';
import { db, LOADING_TIME, newId, save, wait } from './store.js';

export { createBoardRepository };

// The boards with what a list shows of their relations (the chair, the numbers, the next planned meeting).
function summaries(state: Db, boards: readonly Board[] = state.boards): BoardSummary[] {
  const now = localDateTime(new Date());

  return boards.map((board) => {
    const memberships = state.memberships.filter((membership) => membership.boardId === board.id);
    const chair = memberships.find((membership) => membership.role === 'Chair');
    const meetings = state.meetings.filter((meeting) => meeting.boardId === board.id);
    const next = meetings
      .filter((meeting) => meeting.status === 'Planned' && meeting.start >= now)
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

// The boards of the in-memory store.
function createBoardRepository(): BoardRepository {
  return {
    async find(criteria, sort, paging, signal) {
      await wait(LOADING_TIME, signal);

      const found = summaries(db.getState()).filter((board) =>
        containsText([board.name, board.description, board.chair], criteria.text)
        && matchesText(board.name, criteria.name)
        && inList(board.chair, criteria.chairs)
        && inRange(board.nextMeeting, criteria.nextMeeting)
      );

      return pageOf(sorted(found, sort), paging);
    },

    async get(id, signal) {
      await wait(LOADING_TIME, signal);

      const state = db.getState();

      return summaries(state, state.boards.filter((board) => board.id === id))[0];
    },

    async all(signal) {
      await wait(LOADING_TIME, signal);

      return db.getState().boards;
    },

    async create(values) {
      const board: Board = { id: newId('b'), ...values };

      await save((state) => ({ boards: [...state.boards, board] }));

      return board;
    },

    async update(id, values) {
      await save((state) => ({
        boards: state.boards.map((board) => (board.id === id ? { ...board, ...values } : board)),
      }));
    },

    async delete(ids) {
      await save((state) => {
        const meetingIds = new Set(
          state.meetings.filter((meeting) => ids.includes(meeting.boardId)).map((meeting) => meeting.id),
        );

        return {
          boards: state.boards.filter((board) => !ids.includes(board.id)),
          memberships: state.memberships.filter((membership) => !ids.includes(membership.boardId)),
          meetings: state.meetings.filter((meeting) => !meetingIds.has(meeting.id)),
          agendaItems: state.agendaItems.filter((item) => !meetingIds.has(item.meetingId)),
          agendaSections: state.agendaSections.filter((section) => !meetingIds.has(section.meetingId)),
          documents: state.documents.filter((document) => !meetingIds.has(document.meetingId)),
        };
      });
    },
  };
}
