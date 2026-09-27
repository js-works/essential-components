export type { DataNavigator };

declare const builtInFilter: unique symbol;

declare const contentType: unique symbol;

declare namespace DataNavigator {
  type SortDirection = 'asc' | 'desc';

  type SelectionMode = 'none' | 'single' | 'multi';

  type Density = 'compact' | 'normal' | 'comfortable';

  type SelectionAppearance = 'neutral' | 'accent';

  type Sort = { key: string; direction: SortDirection };

  type FilterValue = string | number | boolean | null | readonly FilterValue[] | {
    readonly [key: string]: FilterValue;
  };

  type Query = {
    page: number;
    pageSize: number;
    sort?: Sort;
    search: string;
    filters: Record<string, FilterValue>;
  };

  type Result<Row> = {
    rows: readonly Row[];
    total: number;
  };

  type Source<Row> = (query: Query, signal: AbortSignal) => Promise<Result<Row>>;

  type FilterProps = {
    value: FilterValue | undefined;
    onChange: (value: FilterValue | undefined) => void;
    labelledBy: string;
  };

  type FilterOption = string | { value: string; label: string };

  type TextColumnFilterSettings = { placeholder?: string };

  type SelectColumnFilterSettings = { options: readonly FilterOption[]; multiple?: boolean };

  type DateRangeFilterValue = { from: string; to: string };

  type ColumnAlign = 'start' | 'center' | 'end';

  type ActionVariant = 'primary' | 'secondary' | 'danger';

  type ActionSeparator = { type: 'separator' };

  type Texts = {
    selectedCount: (params: { count: number }) => string; // {count} selected
    itemRange: (params: { from: number; to: number; total: number }) => string; // Items {from}-{to} / {total}
    pageSize: string; // Page Size
    page: string; // Page
    pageOf: (params: { pages: number }) => string; // of {pages}
    firstPage: string; // First page
    previousPage: string; // Previous page
    nextPage: string; // Next page
    lastPage: string; // Last page
    empty: string; // No data
    emptySearch: string; // No results found
    searchPlaceholder: string; // Search
    clearFilter: string; // Clear filter
    filterAll: string; // All
    filterPlaceholder: string; // Filter
    clearSearch: string; // Clear search
    loading: string; // Loading
    selectAll: string; // Select all rows
    deselectAll: string; // Deselect all rows
    selectRow: string; // Select row
    deselectRow: string; // Deselect row
    expandAllDetails: string; // Show all details
    collapseAllDetails: string; // Hide all details
    expandDetails: string; // Show details
    collapseDetails: string; // Hide details
    sortAsc: string; // Sort ascending
    sortDesc: string; // Sort descending
    calendarPrevious: string; // Previous
    calendarNext: string; // Next
    clear: string; // Clear
  };

  type ThemeValue = string | { light: string; dark: string };

  type Theme = {
    colorText?: ThemeValue;
    colorTextDimmed?: ThemeValue;
    colorSurface?: ThemeValue;
    colorBorder?: ThemeValue;
    colorHeader?: ThemeValue;
    colorHeaderHover?: ThemeValue;
    colorHover?: ThemeValue;
    colorHoverBorder?: ThemeValue;
    colorHoverAccent?: ThemeValue;
    colorStripe?: ThemeValue;
    colorStripeHover?: ThemeValue;
    colorSelected?: ThemeValue;
    colorSelectedBorder?: ThemeValue;
    colorSelectedNeutral?: ThemeValue;
    colorPrimary?: ThemeValue;
    colorPrimaryHover?: ThemeValue;
    colorOnPrimary?: ThemeValue;
    colorDanger?: ThemeValue;
    colorFocus?: ThemeValue;
    radius?: string;
    shadow?: string;
    fontFamily?: string;
    fontSize?: string;
    fontSizeSm?: string;
    fontWeightBold?: string;
    spacingXs?: string;
    spacingSm?: string;
    spacingMd?: string;
    controlHeight?: string;
  };

  type I18nAdapter = {
    currentLocale: () => string;
    resolveText: (
      namespace: string,
      key: string,
      params: Readonly<Record<string, unknown>> | null,
      defaultValue: string,
    ) => string;
    onChange?: (listener: () => void) => () => void;
  };

  type ContentAdapter<C> = {
    render: (content: C, container: HTMLElement) => void;
    clear?: (container: HTMLElement) => void;
  };

  type SetupConfig<C = Node> = {
    theme?: Theme;
    i18n?: I18nAdapter;
    content?: ContentAdapter<C>;
  };

  type TextContent<C> = string | (() => string | C);

  type BuiltInColumnFilter = { readonly [builtInFilter]: true };

  type ColumnFilter<C> = BuiltInColumnFilter | ((props: FilterProps) => string | C);

  type Column<Row, C> = {
    key: keyof Row & string;
    header: TextContent<C>;
    width?: number;
    sortable?: boolean;
    align?: ColumnAlign;
    render?: (row: Row) => string | C;
    filter?: ColumnFilter<C>;
    wrap?: boolean;
  };

  type ColumnGroup<Row, C> = {
    header: TextContent<C>;
    columns: readonly Column<Row, C>[];
  };

  type ActionLook<C> =
    | { label: TextContent<C>; icon?: () => C; tip?: string | (() => string) }
    | { label?: undefined; icon: () => C; tip: string | (() => string) };

  type GeneralAction<C> = {
    type: 'general';
    key: string;
    variant?: ActionVariant;
    onClick: () => void;
  } & ActionLook<C>;

  type RowAction<Row, C> = {
    type: 'row';
    key: string;
    variant?: ActionVariant;
    onClick: (row: Row) => void;
    show?: 'column' | 'toolbar' | 'both';
    default?: boolean;
  } & ActionLook<C>;

  type RowsAction<Row, C> = {
    type: 'rows';
    key: string;
    variant?: ActionVariant;
    onClick: (rows: readonly Row[]) => void;
  } & ActionLook<C>;

  type Action<Row, C> = GeneralAction<C> | RowAction<Row, C> | RowsAction<Row, C>;

  type ActionMenu<Row, C> = {
    type: 'menu';
    key: string;
    variant?: ActionVariant;
    actions: readonly (Action<Row, C> | ActionSeparator)[];
  } & ActionLook<C>;

  type ControllerOptions<Row, C> = {
    source: Source<Row>;
    rowKey: keyof Row & string;
    columns: readonly (Column<Row, C> | ColumnGroup<Row, C>)[];
    actions?: readonly (Action<Row, C> | ActionMenu<Row, C>)[];
    renderDetail?: (row: Row) => string | C;
    defaultSort?: { key: keyof Row & string; direction: SortDirection };
    title?: TextContent<C>;
    subtitle?: TextContent<C>;
    empty?: TextContent<C>;
  };

  type NavigatorController<Row, C> = {
    readonly [contentType]: (content: C) => C;
    reload: () => void;
    clearRowSelection: () => void;
    getSelectedRows: () => readonly Row[];
    onSelectionChange: (listener: (rows: readonly Row[]) => void) => () => void;
  };

  type CreateNavigatorController<C> = <Row>(options: ControllerOptions<Row, C>) => NavigatorController<Row, C>;

  type Element<C> = HTMLElement & {
    controller: NavigatorController<unknown, C> | undefined;
    density: Density;
    striped: boolean;
    searchable: boolean;
    selectionAppearance: SelectionAppearance;
    pageSize: number;
    pageSizeOptions: readonly number[];
  };

  type ElementClass<C> = {
    new(): Element<C>;
    readonly prototype: Element<C>;
  };

  type SetupDataNavigator = <C = Node>(
    config?: SetupConfig<C>,
  ) => readonly [ElementClass<C>, CreateNavigatorController<C>];
}
