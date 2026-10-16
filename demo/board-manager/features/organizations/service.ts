import type { OrganizationRepository } from '../../domain/index.js';

export { createOrganizationService };
export type { OrganizationService };

// What the organizations feature's UI calls: today just the repository (no logic of its own yet).
type OrganizationService = ReturnType<typeof createOrganizationService>;

function createOrganizationService({ organizations }: { organizations: OrganizationRepository }) {
  return organizations;
}
