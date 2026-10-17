export type { LocalPageOptions };

type LocalPageOptions<Row> = {
  search: readonly (keyof Row & string)[];
  filters?: Partial<Record<string, (row: Row, value: unknown) => boolean>>;
  sortValue?: Partial<Record<string, (row: Row) => string | number>>;
};
