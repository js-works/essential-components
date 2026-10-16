import type { MembershipRepository, PersonRepository } from '../../domain/index.js';

export { createMemberService };
export type { MemberService };

// What the members feature's UI calls: the people, and their memberships (read only: they are changed on a board).
type MemberService = ReturnType<typeof createMemberService>;

function createMemberService(
  { people, memberships }: { people: PersonRepository; memberships: MembershipRepository },
) {
  return {
    ...people,
    findMemberships: memberships.findOfPerson,
    memberships: memberships.all,
  };
}
