export type { CreateRow, ReorderRows, RowMove, SaveRow };

type RowMove<Row> = { row: Row; group: string | undefined; after: Row | undefined; before: Row | undefined };

type ReorderRows<Row> = (move: RowMove<Row>) => void | Promise<void>;

type SaveRow<Row> = (row: Row, draft: Row) => void | Row | Promise<void | Row>;

type CreateRow<Row> = (draft: Row) => Row | Promise<Row>;
