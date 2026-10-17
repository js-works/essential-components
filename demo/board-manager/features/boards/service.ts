import type { BoardRepository, MembershipRepository, Person, PersonRepository } from '../../domain/index.js';
import { withChanges } from '../../shared/lib/with-changes.js';

export type { BoardService };
export { createBoardService };

// What the boards feature's UI calls: the boards, and their members. After a change, `onChange`.
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
