import type { ContentAdapter } from './content.js';
import type { CreateTableController, TableController } from './controller.js';
import type { I18nAdapter } from './i18n.js';
import type { SavedFilters } from './saved-filters.js';
import type { FooterMode, RowActionLook, SelectionAppearance, TableDensity, TableLayout } from './settings.js';
import type { DataTableTheme } from './theme.js';

export type { DataTableClass, DataTableDefaults, DataTableElement, DataTableSetupConfig, SetupDataTable };

type DataTableSetupConfig<C = Node> = {
  theme?: DataTableTheme;
  i18n?: { type: 'factory'; getAdapter: (element: HTMLElement) => I18nAdapter };
  content?: ContentAdapter<C>;
  // The defaults of every element of this setup, where the element has no attribute (or property) of its own: e.g.
  // `{ selectionAppearance: 'neutral' }` for the whole app. Only the settings with values: a boolean attribute
  // (`striped`, `searchable`, …) cannot say "off", so a default `true` could not be turned off on one element.
  defaults?: DataTableDefaults;
};

type DataTableDefaults = {
  density?: TableDensity;
  layout?: TableLayout;
  footer?: FooterMode;
  rowActionLook?: RowActionLook;
  selectionAppearance?: SelectionAppearance;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
};

type DataTableElement<C> = HTMLElement & {
  controller: TableController<unknown, C> | undefined;
  density: TableDensity;
  layout: TableLayout | undefined;
  footer: FooterMode;
  striped: boolean;
  searchable: boolean;
  reloadable: boolean;
  showTotal: boolean;
  selectableGroups: boolean;
  rowActionLook: RowActionLook;
  selectionAppearance: SelectionAppearance;
  pageSize: number;
  pageSizeOptions: readonly number[];
  savedFilters: SavedFilters | undefined;
};

type DataTableClass<C> = {
  new(): DataTableElement<C>;
  readonly prototype: DataTableElement<C>;
};

type SetupDataTable = <C = Node>(
  config?: DataTableSetupConfig<C>,
) => readonly [DataTableClass<C>, CreateTableController<C>];
