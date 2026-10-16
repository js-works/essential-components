import type { Page, Paging, Range, Sort, TextMatch } from './query.js';

export type { Board, BoardCriteria, BoardRepository, BoardSortKey, BoardSummary, BoardValues };

type Board = { id: string; name: string; description: string };

// What a new board or a change of one gives.
type BoardValues = Pick<Board, 'name' | 'description'>;

// A board with what a list shows of its relations: the chair's name, the numbers of members and meetings, the start of
// the next planned meeting (`''`: none).
type BoardSummary = Board & { chair: string; members: number; meetings: number; nextMeeting: string };

// Which boards a list asks for: a text in the name, the description or the chair; the name matching; one of the
// chairs; the next meeting within a range of days.
type BoardCriteria = {
  text?: string;
  name?: TextMatch;
  chairs?: readonly string[];
  nextMeeting?: Range<string>;
};

type BoardSortKey = 'name' | 'chair' | 'members' | 'meetings' | 'nextMeeting';

// What can be done with boards, independent of where the data lives. Deleting a board deletes what belongs to it:
// its meetings (with their agendas and documents) and its memberships.
interface BoardRepository {
  find(
    criteria: BoardCriteria,
    sort: Sort<BoardSortKey> | undefined,
    paging: Paging,
    signal?: AbortSignal,
  ): Promise<Page<BoardSummary>>;
  get(id: string, signal?: AbortSignal): Promise<BoardSummary | undefined>;
  all(signal?: AbortSignal): Promise<readonly Board[]>;
  create(values: BoardValues): Promise<Board>;
  update(id: string, values: BoardValues): Promise<void>;
  delete(ids: readonly string[]): Promise<void>;
}
