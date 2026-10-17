import type { OrganizationRepository } from '../../domain/index.js';
import { withChanges } from '../../shared/lib/with-changes.js';

export type { OrganizationService };
export { createOrganizationService };

// What the organizations feature's UI calls: today just the repository (no logic of its own yet). After a change,
// `onChange`.
type OrganizationService = ReturnType<typeof createOrganizationService>;

function createOrganizationService(
  { organizations }: { organizations: OrganizationRepository },
  onChange: () => void,
) {
  return withChanges(organizations, ['create', 'update', 'delete'], onChange);
}
