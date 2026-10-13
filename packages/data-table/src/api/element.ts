import type { ContentAdapter } from './content.js';
import type { CreateTableController, TableController } from './controller.js';
import type { I18nAdapter } from './i18n.js';
import type { SavedFilters } from './saved-filters.js';
import type { Density, FooterMode, Layout, RowActionLook, SelectionAppearance } from './settings.js';
import type { Theme } from './theme.js';

export type { DataTableElement, ElementClass, ElementDefaults, SetupConfig, SetupDataTable };

type SetupConfig<C = Node> = {
  theme?: Theme;
  i18n?: { type: 'factory'; getAdapter: (element: HTMLElement) => I18nAdapter };
  content?: ContentAdapter<C>;
  // The defaults of every element of this setup, where the element has no attribute (or property) of its own: e.g.
  // `{ selectionAppearance: 'neutral' }` for the whole app. Only the settings with values: a boolean attribute
  // (`striped`, `searchable`, …) cannot say "off", so a default `true` could not be turned off on one element.
  defaults?: ElementDefaults;
};

type ElementDefaults = {
  density?: Density;
  layout?: Layout;
  footer?: FooterMode;
  rowActionLook?: RowActionLook;
  selectionAppearance?: SelectionAppearance;
  pageSize?: number;
  pageSizeOptions?: readonly number[];
};

type DataTableElement<C> = HTMLElement & {
  controller: TableController<unknown, C> | undefined;
  density: Density;
  layout: Layout | undefined;
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

type ElementClass<C> = {
  new(): DataTableElement<C>;
  readonly prototype: DataTableElement<C>;
};

type SetupDataTable = <C = Node>(
  config?: SetupConfig<C>,
) => readonly [ElementClass<C>, CreateTableController<C>];
