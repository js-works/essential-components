import type { BoardRepository, MembershipRepository, Person, PersonRepository } from '../../domain/index.js';

export { createBoardService };
export type { BoardService };

// What the boards feature's UI calls: the boards, and their members.
type BoardService = ReturnType<typeof createBoardService>;

function createBoardService(
  { boards, memberships, people }: {
    boards: BoardRepository;
    memberships: MembershipRepository;
    people: PersonRepository;
  },
) {
  return {
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
}
