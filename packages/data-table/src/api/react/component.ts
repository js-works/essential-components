import type { ReactElement, ReactNode } from 'react';
import type { SetupConfig } from '../element.js';
import type { I18nAdapter } from '../i18n.js';
import type { FilterValue, GroupBy, RowGroup, Sort, Source } from '../query.js';
import type { CreateRow, Reorder, SaveRow } from '../rows.js';
import type { SavedFilters } from '../saved-filters.js';
import type { Density, FooterMode, Layout, RowActionLook, SelectionAppearance } from '../settings.js';
import type { Theme } from '../theme.js';
import type { Action, ActionMenu } from './actions.js';
import type { Column, ColumnGroup, EditField } from './columns.js';

export type { Component, Config, Controller, Props };

type Props<Row> = {
  source: Source<Row>;
  reorder?: Reorder<Row>;
  saveRow?: SaveRow<Row>;
  createRow?: CreateRow<Row>;
  editFields?: readonly EditField<Row>[];
  rowKey: keyof Row & string;
  columns: readonly (Column<Row> | ColumnGroup<Row>)[];
  title?: ReactNode;
  subtitle?: ReactNode;
  selectionAppearance?: SelectionAppearance;
  density?: Density;
  layout?: Layout;
  footer?: FooterMode;
  striped?: boolean;
  renderDetail?: (row: Row) => ReactNode;
  groupBy?: GroupBy<Row>;
  renderGroup?: (group: RowGroup<Row>) => ReactNode;
  empty?: ReactNode;
  actions?: readonly (Action<Row> | ActionMenu<Row>)[];
  pageSize?: number;
  pageSizeOptions?: readonly number[];
  defaultSort?: Sort;
  defaultFilters?: Record<string, FilterValue>;
  searchable?: boolean;
  reloadable?: boolean;
  showTotal?: boolean;
  selectableGroups?: boolean;
  rowActionLook?: RowActionLook;
  controller?: Controller<Row>;
  savedFilters?: SavedFilters;
};

type Config = {
  i18n?: NonNullable<SetupConfig['i18n']> | { type: 'hook'; useAdapter: () => I18nAdapter };
  theme?: Theme;
};

type Component = <Row>(props: Props<Row>) => ReactElement;

type Controller<Row> = {
  reload: () => void;
  clearRowSelection: () => void;
  getSelectedRows: () => readonly Row[];
  editRow: (row: Row) => void;
  addRow: (template: Row) => void;
};
