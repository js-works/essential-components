import type { ActionMenu, TableAction } from './actions.js';
import type { ColumnGroup, EditField, TableColumn, TableFilters } from './columns.js';
import type { TextContent } from './content.js';
import type { FilterValue, GroupBy, RowGroup, RowSource, SortDirection } from './query.js';
import type { CreateRow, ReorderRows, SaveRow } from './rows.js';

export type { ControllerOptions, CreateTableController, TableController };

declare const contentType: unique symbol;

type ControllerOptions<Row, C> = {
  source: RowSource<Row>;
  reorder?: ReorderRows<Row>;
  saveRow?: SaveRow<Row>;
  createRow?: CreateRow<Row>;
  editFields?: readonly EditField<Row, C>[];
  rowKey: keyof Row & string;
  columns: readonly (TableColumn<Row, C> | ColumnGroup<Row, C>)[];
  filters?: TableFilters<C>;
  actions?: readonly (TableAction<Row, C> | ActionMenu<Row, C>)[];
  renderDetail?: (row: Row) => string | C;
  groupBy?: GroupBy<Row>;
  renderGroup?: (group: RowGroup<Row>) => string | C;
  defaultSort?: { key: keyof Row & string; direction: SortDirection };
  defaultFilters?: Record<string, FilterValue>;
  title?: TextContent<C>;
  subtitle?: TextContent<C>;
  empty?: TextContent<C>;
};

type TableController<Row, C> = {
  readonly [contentType]: (content: C) => C;
  reload: () => void;
  clearRowSelection: () => void;
  getSelectedRows: () => readonly Row[];
  editRow(row: Row): void;
  addRow(template: Row): void;
  onSelectionChange: (listener: (rows: readonly Row[]) => void) => () => void;
};

type CreateTableController<C> = <Row>(options: ControllerOptions<Row, C>) => TableController<Row, C>;
