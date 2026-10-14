import type { ReactNode } from 'react';
import type { EditorProps } from '../editors.js';
import type { FilterProps } from '../filters.js';
import type { ColumnAlign } from '../settings.js';

export type { ColumnEditor, ColumnFilter, ColumnGroup, EditField, TableColumn };

type ColumnFilter = (props: FilterProps) => ReactNode;

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
  filter?: ColumnFilter;
  edit?: ColumnEditor<Row>;
  wrap?: boolean;
  hideable?: boolean;
  hidden?: boolean;
};

type ColumnGroup<Row> = {
  header: ReactNode;
  columns: readonly TableColumn<Row>[];
};
