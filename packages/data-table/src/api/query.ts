export type { ColumnSort, FilterValue, GroupBy, GroupTotal, RowGroup, RowPage, RowQuery, RowSource, SortDirection };

type SortDirection = 'asc' | 'desc';

type ColumnSort = { key: string; direction: SortDirection };

type FilterValue = string | number | boolean | null | readonly FilterValue[] | {
  readonly [key: string]: FilterValue;
};

type RowQuery = {
  page: number;
  pageSize: number;
  sort?: ColumnSort;
  search: string;
  filters: Record<string, FilterValue>;
};

type RowPage<Row> = {
  rows: readonly Row[];
  total: number;
  groups?: readonly GroupTotal[];
};

type GroupTotal = { key: string; total: number };

type GroupBy<Row> = (keyof Row & string) | ((row: Row) => string);

type RowGroup<Row> = { key: string; rows: readonly Row[]; total: number | undefined };

type RowSource<Row> = (query: RowQuery, signal: AbortSignal) => Promise<RowPage<Row>>;
