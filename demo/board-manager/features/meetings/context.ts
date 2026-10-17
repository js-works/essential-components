import { createServiceContext } from '../../shared/lib/service-context.js';
import type { MeetingService } from './service.js';

export { MeetingServiceContext, useMeetingService };

const [MeetingServiceContext, useMeetingService] = createServiceContext<MeetingService>('MeetingService');
