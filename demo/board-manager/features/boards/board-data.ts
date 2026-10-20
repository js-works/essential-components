import type { BoardRepository, MembershipRepository, Person, PersonRepository } from '../../domain/index.js';
import { useRead, useRecord } from '../../shared/lib/queries.js';
import { createServiceContext } from '../../shared/lib/service-context.js';
import { withChanges } from '../../shared/lib/with-changes.js';

export type { BoardService };
export { BoardServiceContext, createBoardService, useBoard, useBoardList, useBoardService };

// What the boards' UI calls: the boards, and their members. After a change, `onChange`.
type BoardService = ReturnType<typeof createBoardService>;

function createBoardService(
  { boards, memberships, people }: {
    boards: BoardRepository;
    memberships: MembershipRepository;
    people: PersonRepository;
  },
  onChange: () => void,
) {
  const service = {
    ...boards,
    findMembers: memberships.findOfBoard,
    addMember: memberships.add,
    changeRole: memberships.changeRole,
    removeMembers: memberships.remove,
    suggestPeople: people.suggest,

    // The people who are not on the board yet.
    async candidates(boardId: string, signal?: AbortSignal): Promise<readonly Person[]> {
      const [all, members] = await Promise.all([people.all(signal), memberships.all(signal)]);
      const onBoard = new Set(
        members.filter((membership) => membership.boardId === boardId).map((membership) => membership.personId),
      );

      return all.filter((person) => !onBoard.has(person.id));
    },
  };

  return withChanges(
    service,
    ['create', 'update', 'delete', 'addMember', 'changeRole', 'removeMembers'],
    onChange,
  );
}

const [BoardServiceContext, useBoardService] = createServiceContext<BoardService>('BoardService');

// One board with its summary (the chair, the numbers, the next meeting).
function useBoard(boardId: string) {
  const service = useBoardService();
  const { record, isPending } = useRecord(['boards', 'detail', boardId], (signal) => service.get(boardId, signal));

  return { board: record, isPending };
}

// All boards (`[]` while they load).
function useBoardList() {
  const service = useBoardService();

  return useRead(['boards', 'list'], (signal) => service.all(signal)) ?? [];
}
