import { createContext, useContext } from 'react';
import type { MemberService } from './service.js';

export { MemberServiceContext, useMemberService };

// The feature's service, given by the app (its wiring decides on the repositories behind it).
const MemberServiceContext = createContext<MemberService | null>(null);

function useMemberService(): MemberService {
  const service = useContext(MemberServiceContext);

  if (service === null) {
    throw new Error('useMemberService: no MemberServiceContext around it.');
  }

  return service;
}
