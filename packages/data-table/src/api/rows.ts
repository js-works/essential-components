export type { CreateRow, Move, Reorder, SaveRow };

type Move<Row> = { row: Row; group: string | undefined; after: Row | undefined; before: Row | undefined };

type Reorder<Row> = (move: Move<Row>) => void | Promise<void>;

type SaveRow<Row> = (row: Row, draft: Row) => void | Row | Promise<void | Row>;

type CreateRow<Row> = (draft: Row) => Row | Promise<Row>;
