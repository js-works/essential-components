import { useRead, useRecord } from '../../shared/lib/queries.js';
import { useBoardService } from './context.js';
import { boardKeys } from './keys.js';

export { useBoard, useBoardList };

// One board with its summary (the chair, the numbers, the next meeting).
function useBoard(boardId: string) {
  const service = useBoardService();
  const { record, isPending } = useRecord(boardKeys.detail(boardId), (signal) => service.get(boardId, signal));

  return { board: record, isPending };
}

// All boards (`[]` while they load).
function useBoardList() {
  const service = useBoardService();

  return useRead(boardKeys.list(), (signal) => service.all(signal)) ?? [];
}
