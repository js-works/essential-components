import type { ReactNode } from 'react';
import type { EditorProps } from '../editors.js';
import type { FilterProps } from '../filters.js';
import type { ColumnAlign } from '../settings.js';

export type { ColumnEditor, ColumnGroup, EditField, TableColumn, TableColumns, TableFilter, TableFilters };

type TableFilter = (props: FilterProps) => ReactNode;

type TableFilters = Readonly<Record<string, TableFilter>>;

type ColumnEditor<Row> = (props: EditorProps<Row>) => ReactNode;

type EditField<Row> = {
  key: keyof Row & string;
  label: ReactNode;
  edit: ColumnEditor<Row>;
};

type TableColumn<Row> = {
  key: keyof Row & string;
  header: ReactNode;
  width?: number | string;
  sortable?: boolean;
  resizable?: boolean;
  align?: ColumnAlign;
  render?: (row: Row) => ReactNode;
  edit?: ColumnEditor<Row>;
  wrap?: boolean;
  hideable?: boolean;
  hidden?: boolean;
};

type TableColumns<Row> = readonly (TableColumn<Row> | ColumnGroup<Row>)[];

type ColumnGroup<Row> = {
  header: ReactNode;
  columns: readonly TableColumn<Row>[];
};
