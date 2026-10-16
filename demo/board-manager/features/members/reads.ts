import { useRead, useRecord } from '../../shared/lib/queries.js';
import { useMemberService } from './context.js';
import { memberKeys } from './keys.js';

export { useMembershipList, usePerson, usePersonList };

// One person with their organization, boards and roles.
function usePerson(personId: string) {
  const service = useMemberService();
  const { record, isPending } = useRecord(memberKeys.detail(personId), (signal) => service.get(personId, signal));

  return { person: record, isPending };
}

// All people (`[]` while they load).
function usePersonList() {
  const service = useMemberService();

  return useRead(memberKeys.list(), (signal) => service.all(signal)) ?? [];
}

// All memberships (`[]` while they load).
function useMembershipList() {
  const service = useMemberService();

  return useRead(memberKeys.memberships(), (signal) => service.memberships(signal)) ?? [];
}
