import type { MembershipRepository, PersonRepository } from '../../domain/index.js';
import { useRead, useRecord } from '../../shared/lib/queries.js';
import { createServiceContext } from '../../shared/lib/service-context.js';
import { withChanges } from '../../shared/lib/with-changes.js';

export type { MemberService };
export { createMemberService, MemberServiceContext, useMemberService, useMembershipList, usePerson, usePersonList };

// What the members' UI calls: the people, and their memberships (read only: they are changed on a board). After a
// change, `onChange`.
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

const [MemberServiceContext, useMemberService] = createServiceContext<MemberService>('MemberService');

// One person with their organization, boards and roles.
function usePerson(personId: string) {
  const service = useMemberService();
  const { record, isPending } = useRecord(['people', 'detail', personId], (signal) => service.get(personId, signal));

  return { person: record, isPending };
}

// All people (`[]` while they load).
function usePersonList() {
  const service = useMemberService();

  return useRead(['people', 'list'], (signal) => service.all(signal)) ?? [];
}

// All memberships (`[]` while they load).
function useMembershipList() {
  const service = useMemberService();

  return useRead(['people', 'memberships'], (signal) => service.memberships(signal)) ?? [];
}
