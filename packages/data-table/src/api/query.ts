export type { FilterValue, GroupBy, Query, Result, ResultGroup, RowGroup, Sort, SortDirection, Source };

type SortDirection = 'asc' | 'desc';

type Sort = { key: string; direction: SortDirection };

type FilterValue = string | number | boolean | null | readonly FilterValue[] | {
  readonly [key: string]: FilterValue;
};

type Query = {
  page: number;
  pageSize: number;
  sort?: Sort;
  search: string;
  filters: Record<string, FilterValue>;
};

type Result<Row> = {
  rows: readonly Row[];
  total: number;
  groups?: readonly ResultGroup[];
};

type ResultGroup = { key: string; total: number };

type GroupBy<Row> = (keyof Row & string) | ((row: Row) => string);

type RowGroup<Row> = { key: string; rows: readonly Row[]; total: number | undefined };

type Source<Row> = (query: Query, signal: AbortSignal) => Promise<Result<Row>>;
