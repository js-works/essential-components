import type { OrganizationRepository } from '../../domain/index.js';
import { useRead, useRecord } from '../../shared/lib/queries.js';
import { createServiceContext } from '../../shared/lib/service-context.js';

export { OrganizationServiceContext, useOrganization, useOrganizationList, useOrganizationService };

// The repository, given by the app (its changes say so: every read loads again).
const [OrganizationServiceContext, useOrganizationService] = createServiceContext<OrganizationRepository>(
  'OrganizationService',
);

// One organization with how many people belong to it.
function useOrganization(organizationId: string) {
  const service = useOrganizationService();
  const { record, isPending } = useRecord(
    ['organizations', 'detail', organizationId],
    (signal) => service.get(organizationId, signal),
  );

  return { organization: record, isPending };
}

// All organizations, by name (`[]` while they load).
function useOrganizationList() {
  const service = useOrganizationService();

  return useRead(
    ['organizations', 'list'],
    async (signal) => [...(await service.all(signal))].sort((a, b) => a.name.localeCompare(b.name)),
  ) ?? [];
}
