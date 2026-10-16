import { createContext, useContext } from 'react';
import type { BoardService } from './service.js';

export { BoardServiceContext, useBoardService };

// The feature's service, given by the app (its wiring decides on the repository behind it).
const BoardServiceContext = createContext<BoardService | null>(null);

function useBoardService(): BoardService {
  const service = useContext(BoardServiceContext);

  if (service === null) {
    throw new Error('useBoardService: no BoardServiceContext around it.');
  }

  return service;
}
