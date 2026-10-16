import { createContext, useContext } from 'react';
import type { OrganizationService } from './service.js';

export { OrganizationServiceContext, useOrganizationService };

// The feature's service, given by the app (its wiring decides on the repositories behind it).
const OrganizationServiceContext = createContext<OrganizationService | null>(null);

function useOrganizationService(): OrganizationService {
  const service = useContext(OrganizationServiceContext);

  if (service === null) {
    throw new Error('useOrganizationService: no OrganizationServiceContext around it.');
  }

  return service;
}
