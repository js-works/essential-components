import type { ReactElement, ReactNode } from 'react';
import type { DataTableSetupConfig } from '../element.js';
import type { I18nAdapter } from '../i18n.js';
import type { ColumnSort, FilterValue, GroupBy, RowGroup, RowSource } from '../query.js';
import type { CreateRow, ReorderRows, SaveRow } from '../rows.js';
import type { SavedFilters } from '../saved-filters.js';
import type { FooterMode, RowActionLook, SelectionAppearance, TableDensity, TableLayout } from '../settings.js';
import type { DataTableTheme } from '../theme.js';
import type { ActionMenu, TableAction } from './actions.js';
import type { ColumnGroup, EditField, TableColumn, TableFilters } from './columns.js';

export type { DataTableComponent, DataTableComponentConfig, DataTableProps, TableController };

type DataTableProps<Row> = {
  source: RowSource<Row>;
  reorder?: ReorderRows<Row>;
  saveRow?: SaveRow<Row>;
  createRow?: CreateRow<Row>;
  editFields?: readonly EditField<Row>[];
  rowKey: keyof Row & string;
  columns: readonly (TableColumn<Row> | ColumnGroup<Row>)[];
  filters?: TableFilters;
  title?: ReactNode;
  subtitle?: ReactNode;
  selectionAppearance?: SelectionAppearance;
  density?: TableDensity;
  layout?: TableLayout;
  footer?: FooterMode;
  striped?: boolean;
  renderDetail?: (row: Row) => ReactNode;
  groupBy?: GroupBy<Row>;
  renderGroup?: (group: RowGroup<Row>) => ReactNode;
  empty?: ReactNode;
  actions?: readonly (TableAction<Row> | ActionMenu<Row>)[];
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  defaultSort?: ColumnSort;
  defaultFilters?: Record<string, FilterValue>;
  searchable?: boolean;
  reloadable?: boolean;
  showTotal?: boolean;
  selectableGroups?: boolean;
  rowActionLook?: RowActionLook;
  controller?: TableController<Row>;
  savedFilters?: SavedFilters;
};

type DataTableComponentConfig = {
  i18n?: NonNullable<DataTableSetupConfig['i18n']> | { type: 'hook'; useAdapter: () => I18nAdapter };
  theme?: DataTableTheme;
};

type DataTableComponent = <Row>(props: DataTableProps<Row>) => ReactElement;

type TableController<Row> = {
  reload: () => void;
  clearRowSelection: () => void;
  getSelectedRows: () => readonly Row[];
  editRow: (row: Row) => void;
  addRow: (template: Row) => void;
};
