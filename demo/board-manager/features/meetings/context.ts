import { createContext, useContext } from 'react';
import type { MeetingService } from './service.js';

export { MeetingServiceContext, useMeetingService };

// The feature's service, given by the app (its wiring decides on the repositories behind it).
const MeetingServiceContext = createContext<MeetingService | null>(null);

function useMeetingService(): MeetingService {
  const service = useContext(MeetingServiceContext);

  if (service === null) {
    throw new Error('useMeetingService: no MeetingServiceContext around it.');
  }

  return service;
}
