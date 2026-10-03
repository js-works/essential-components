import type { DataNavigatorComponent } from '../../../../packages/data-navigator/src/react';
import type { Board } from '../../domain';
import { localDateTime } from './helpers';
import { getPerson } from './lookups';
import { matches, oneOf, runQuery, within } from './query';
import { db, LOADING_TIME, newId, save, wait } from './store';
import type { Db } from './store';

export { createBoard, deleteBoards, fetchBoards, updateBoard };
export type { BoardRow };

// The rows of the tables: a record with what the table shows of its relations.
type BoardRow = Board & { chair: string; members: number; meetings: number; nextMeeting: string };

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
      chair: (row, value) => oneOf(row.chair, value),
      nextMeeting: (row, value) => within(row.nextMeeting, value),
    },
  });
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
