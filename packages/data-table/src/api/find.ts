import type { RowPaging, RowSort } from './query.js';

export type { FindRows, FoundPage };

type FoundPage<Row> = { items: readonly Row[]; total: number };

type FindRows<Row, Criteria, K extends string> = (
  criteria: Criteria,
  sort: RowSort<K> | undefined,
  paging: RowPaging,
  signal: AbortSignal,
) => Promise<FoundPage<Row>>;
