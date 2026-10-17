import { createServiceContext } from '../../shared/lib/service-context.js';
import type { OrganizationService } from './service.js';

export { OrganizationServiceContext, useOrganizationService };

const [OrganizationServiceContext, useOrganizationService] = createServiceContext<OrganizationService>(
  'OrganizationService',
);
