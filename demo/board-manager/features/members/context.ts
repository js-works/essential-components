import { createServiceContext } from '../../shared/lib/service-context.js';
import type { MemberService } from './service.js';

export { MemberServiceContext, useMemberService };

const [MemberServiceContext, useMemberService] = createServiceContext<MemberService>('MemberService');
