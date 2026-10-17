// The organizations feature: the only import path for the app.

export { OrganizationServiceContext, useOrganizationService } from './context.js';
export { useOrganization, useOrganizationList } from './reads.js';
export type { OrganizationService } from './service.js';
export { createOrganizationService } from './service.js';
