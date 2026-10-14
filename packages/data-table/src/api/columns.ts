import type { TextContent } from './content.js';
import type { EditorProps } from './editors.js';
import type { FilterProps } from './filters.js';
import type { ColumnAlign } from './settings.js';

export type {
  BuiltInColumnEditor,
  BuiltInColumnFilter,
  ColumnEditor,
  ColumnFilter,
  ColumnGroup,
  EditField,
  TableColumn,
};

declare const builtInFilter: unique symbol;

declare const builtInEditor: unique symbol;

type BuiltInColumnFilter = { readonly [builtInFilter]: true };

type ColumnFilter<C> = BuiltInColumnFilter | ((props: FilterProps) => string | C);

type BuiltInColumnEditor = { readonly [builtInEditor]: true };

type ColumnEditor<Row, C> = BuiltInColumnEditor | ((props: EditorProps<Row>) => string | C);

type EditField<Row, C> = {
  key: keyof Row & string;
  label: TextContent<C>;
  edit: ColumnEditor<Row, C>;
};

type TableColumn<Row, C> = {
  key: keyof Row & string;
  header: TextContent<C>;
  width?: number | string;
  sortable?: boolean;
  resizable?: boolean;
  align?: ColumnAlign;
  render?: (row: Row) => string | C;
  filter?: ColumnFilter<C>;
  edit?: ColumnEditor<Row, C>;
  wrap?: boolean;
  hideable?: boolean;
  hidden?: boolean;
};

type ColumnGroup<Row, C> = {
  header: TextContent<C>;
  columns: readonly TableColumn<Row, C>[];
};
