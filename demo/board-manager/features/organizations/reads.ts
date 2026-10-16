import { useRead, useRecord } from '../../shared/lib/queries.js';
import { useOrganizationService } from './context.js';
import { organizationKeys } from './keys.js';

export { useOrganization, useOrganizationList };

// One organization with how many people belong to it.
function useOrganization(organizationId: string) {
  const service = useOrganizationService();
  const { record, isPending } = useRecord(
    organizationKeys.detail(organizationId),
    (signal) => service.get(organizationId, signal),
  );

  return { organization: record, isPending };
}

// All organizations, by name (`[]` while they load).
function useOrganizationList() {
  const service = useOrganizationService();

  return useRead(
    organizationKeys.list(),
    async (signal) => [...(await service.all(signal))].sort((a, b) => a.name.localeCompare(b.name)),
  ) ?? [];
}
