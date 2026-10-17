import type { MembershipRepository, PersonRepository } from '../../domain/index.js';
import { withChanges } from '../../shared/lib/with-changes.js';

export type { MemberService };
export { createMemberService };

// What the members feature's UI calls: the people, and their memberships (read only: they are changed on a board).
// After a change, `onChange`.
type MemberService = ReturnType<typeof createMemberService>;

function createMemberService(
  { people, memberships }: { people: PersonRepository; memberships: MembershipRepository },
  onChange: () => void,
) {
  return withChanges(
    { ...people, findMemberships: memberships.findOfPerson, memberships: memberships.all },
    ['create', 'update', 'delete'],
    onChange,
  );
}
