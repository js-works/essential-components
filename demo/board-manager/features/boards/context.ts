import { createServiceContext } from '../../shared/lib/service-context.js';
import type { BoardService } from './service.js';

export { BoardServiceContext, useBoardService };

const [BoardServiceContext, useBoardService] = createServiceContext<BoardService>('BoardService');
