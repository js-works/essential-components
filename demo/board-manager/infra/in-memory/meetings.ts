import type { DataNavigatorComponent } from '../../../../packages/data-navigator/src/react';
import type { AgendaItem, Meeting, MeetingStatus } from '../../domain';
import { boardIdsOf, getBoard } from './lookups';
import { matches, oneOf, runQuery, within } from './query';
import { db, LOADING_TIME, newId, save, wait } from './store';
import type { Db } from './store';

export { approveMinutes, createMeeting, deleteMeetings, fetchMeetings, setMeetingStatus, updateMeeting };
export type { MeetingRow };

type MeetingRow = Meeting & { board: string; items: number; documents: number };

function meetingRows(state: Db): MeetingRow[] {
  return state.meetings.map((meeting) => ({
    ...meeting,
    board: getBoard(state, meeting.boardId)?.name ?? '',
    items: state.agendaItems.filter((item) => item.meetingId === meeting.id).length,
    documents: state.documents.filter((document) => document.meetingId === meeting.id).length,
  }));
}

// The meetings of one board (`boardId`), of the boards of one person (`personId`), or of all boards (neither).
function fetchMeetings(
  { boardId, personId }: { boardId?: string; personId?: string } = {},
): DataNavigatorComponent.Source<MeetingRow> {
  return async (query, signal) => {
    await wait(LOADING_TIME, signal);

    const state = db.getState();
    const boardIds = personId === undefined ? undefined : boardIdsOf(state, personId);
    const rows = meetingRows(state).filter((row) =>
      (boardId === undefined || row.boardId === boardId) && (boardIds === undefined || boardIds.includes(row.boardId))
    );

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
