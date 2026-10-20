import type { TableFilter } from '@local/data-table/react';
import { selectFilter } from '@local/data-table/react';

import type { Board } from '../../domain/index.js';

export { boardFilter };

// The filter of a board (by its name): the given boards.
function boardFilter(boards: readonly Board[]): TableFilter {
  return selectFilter({ options: boards.map((board) => board.name), multiple: true });
}
