import type { Page, Paging, Range, Sort, TextMatch } from './query.js';

export { MEETING_STATUSES };
export type {
  Meeting,
  MeetingCriteria,
  MeetingRepository,
  MeetingSortKey,
  MeetingStatus,
  MeetingSummary,
  MeetingValues,
  MinutesState,
};

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

// What a new meeting or a change of one gives.
type MeetingValues = Pick<Meeting, 'title' | 'start' | 'location'>;

// A meeting with what a list shows of its relations: its board's name, the numbers of agenda items and documents.
type MeetingSummary = Meeting & { board: string; items: number; documents: number };

// The minutes of a held meeting: approved or a draft (other meetings have none).
type MinutesState = 'approved' | 'draft';

// Which meetings a list asks for: of one board, of the boards of one person; a text in the title, the board, the
// location or the status; the title and the location matching; one of the boards (by name), statuses, states of the
// minutes; the start within a range of days.
type MeetingCriteria = {
  boardId?: string;
  personId?: string;
  text?: string;
  title?: TextMatch;
  location?: TextMatch;
  boards?: readonly string[];
  statuses?: readonly MeetingStatus[];
  minutes?: readonly MinutesState[];
  start?: Range<string>;
};

type MeetingSortKey = 'start' | 'title' | 'board' | 'status' | 'items' | 'documents';

// What can be done with meetings. A new meeting gets the two standard items and "Any other business", presented by the
// board's chair. Deleting a meeting deletes its agenda and documents.
interface MeetingRepository {
  find(
    criteria: MeetingCriteria,
    sort: Sort<MeetingSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<MeetingSummary>>;
  get(id: string, signal?: AbortSignal): Promise<MeetingSummary | undefined>;
  all(signal?: AbortSignal): Promise<readonly Meeting[]>;
  create(boardId: string, values: MeetingValues): Promise<Meeting>;
  update(id: string, values: MeetingValues): Promise<void>;
  setStatus(id: string, status: MeetingStatus): Promise<void>;
  approveMinutes(id: string): Promise<void>;
  delete(ids: readonly string[]): Promise<void>;
}
