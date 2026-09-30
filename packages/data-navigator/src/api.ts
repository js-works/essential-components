export type { DataNavigator };

declare const builtInFilter: unique symbol;

declare const builtInEditor: unique symbol;

declare const contentType: unique symbol;

declare namespace DataNavigator {
  type SortDirection = 'asc' | 'desc';

  type SelectionMode = 'none' | 'single' | 'multi';

  type Density = 'compact' | 'normal' | 'comfortable';

  type FooterMode = 'always' | 'auto' | 'never';

  type SelectionAppearance = 'neutral' | 'accent';

  type RowActionLook = 'icon' | 'label' | 'iconAndLabel';

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
    groups?: readonly ResultGroup[];
  };

  type ResultGroup = { key: string; total: number };

  type GroupBy<Row> = (keyof Row & string) | ((row: Row) => string);

  type RowGroup<Row> = { key: string; rows: readonly Row[]; total: number | undefined };

  type Source<Row> = (query: Query, signal: AbortSignal) => Promise<Result<Row>>;

  type Move<Row> = { row: Row; group: string | undefined; after: Row | undefined; before: Row | undefined };

  type Reorder<Row> = (move: Move<Row>) => void | Promise<void>;

  type SaveRow<Row> = (row: Row, draft: Row) => void | Row | Promise<void | Row>;

  type CreateRow<Row> = (draft: Row) => Row | Promise<Row>;

  type EditorProps<Row> = {
    row: Row;
    draft: Row;
    columnKey: keyof Row & string;
    value: unknown;
    change: (patch: Partial<Row>) => void;
    labelledBy: string;
  };

  type TextColumnEditorSettings = { placeholder?: string };

  type SelectColumnEditorSettings = { options: readonly FilterOption[] };

  type DateColumnEditorSettings = { placeholder?: string };

  type FilterProps = {
    value: FilterValue | undefined;
    onChange: (value: FilterValue | undefined) => void;
    labelledBy: string;
  };

  type FilterOption = string | { value: string; label: string };

  type TextColumnFilterSettings = { placeholder?: string };

  type TextFilterMatch = 'contains' | 'startsWith' | 'endsWith';

  type TextFilterValue = { text: string; match: TextFilterMatch };

  type SelectColumnFilterSettings = { options: readonly FilterOption[]; multiple?: boolean };

  type DateRangeFilterValue = { from: string; to: string };

  type NumberRangeFilterValue = { from?: number; to?: number };

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
    empty: string; // No entries
    emptySearch: string; // No results found
    searchPlaceholder: string; // Search
    clearFilter: string; // Clear filter
    filterAll: string; // All
    filterPlaceholder: string; // Filter
    clearSearch: string; // Clear search
    reload: string; // Reload
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
    filters: string; // Filters
    activeFilters: (params: { count: number }) => string; // {count} active
    resetFilters: string; // Reset
    applyFilters: string; // Apply
    cancelFilters: string; // Cancel
    clearAllFilters: string; // Clear all
    removeFilter: string; // Remove filter
    emptyFilters: string; // No rows match these filters
    clearFilters: string; // Clear filters
    textMatch: string; // Match
    textContains: string; // contains
    textStartsWith: string; // starts with
    textEndsWith: string; // ends with
    rangeFrom: string; // From
    rangeTo: string; // To
    filterYes: string; // Yes
    filterNo: string; // No
    clearSelection: string; // Clear selection
    columns: string; // Columns
    moveRow: string; // Move row
    emptyGroup: string; // (Blank)
    movedTo: (params: { position: number }) => string; // Moved to position {position}
    expandGroup: string; // Show group
    collapseGroup: string; // Hide group
    selectGroup: string; // Select group
    deselectGroup: string; // Deselect group
    groupCount: (params: { count: number }) => string; // {count}
    groupPartial: (params: { shown: number; total: number }) => string; // {shown} of {total}
    confirmEdit: string; // OK
    cancelEdit: string; // Cancel
    saveFailed: string; // The row could not be saved
    editRow: string; // Edit row
    newRow: string; // New row
  };

  type ThemeValue = string | { light: string; dark: string };

  type Theme = {
    colorText?: ThemeValue;
    colorTextDimmed?: ThemeValue;
    colorSurface?: ThemeValue;
    colorSurfaceStrong?: ThemeValue;
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
    buttonRadius?: string;
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

  type BuiltInColumnEditor = { readonly [builtInEditor]: true };

  type ColumnEditor<Row, C> = BuiltInColumnEditor | ((props: EditorProps<Row>) => string | C);

  type EditField<Row, C> = {
    key: keyof Row & string;
    label: TextContent<C>;
    edit: ColumnEditor<Row, C>;
  };

  type Column<Row, C> = {
    key: keyof Row & string;
    header: TextContent<C>;
    width?: number | string;
    sortable?: boolean;
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
    columns: readonly Column<Row, C>[];
  };

  type ActionLook<C> =
    | { label: TextContent<C>; icon?: () => C; tip?: string | (() => string) }
    | { label?: undefined; icon: () => C; tip: string | (() => string) };

  type GeneralAction<C> = {
    type: 'general';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    onClick: () => void;
  } & ActionLook<C>;

  type RowAction<Row, C> = {
    type: 'singleRow';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    onClick: (row: Row) => void;
    show?: 'column' | 'toolbar' | 'both';
    default?: boolean;
  } & ActionLook<C>;

  type RowsAction<Row, C> = {
    type: 'multiRow';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    onClick: (rows: readonly Row[]) => void;
  } & ActionLook<C>;

  type GroupAction<Row, C> = {
    type: 'group';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    onClick: (group: RowGroup<Row>) => void;
  } & ActionLook<C>;

  type Action<Row, C> = GeneralAction<C> | RowAction<Row, C> | RowsAction<Row, C> | GroupAction<Row, C>;

  type ActionMenu<Row, C> = {
    type: 'menu';
    key: string;
    variant?: ActionVariant;
    actions: readonly (Action<Row, C> | ActionSeparator)[];
  } & ActionLook<C>;

  type ControllerOptions<Row, C> = {
    source: Source<Row>;
    reorder?: Reorder<Row>;
    saveRow?: SaveRow<Row>;
    createRow?: CreateRow<Row>;
    editFields?: readonly EditField<Row, C>[];
    rowKey: keyof Row & string;
    columns: readonly (Column<Row, C> | ColumnGroup<Row, C>)[];
    actions?: readonly (Action<Row, C> | ActionMenu<Row, C>)[];
    renderDetail?: (row: Row) => string | C;
    groupBy?: GroupBy<Row>;
    renderGroup?: (group: RowGroup<Row>) => string | C;
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
    editRow(row: Row): void;
    addRow(template: Row): void;
    onSelectionChange: (listener: (rows: readonly Row[]) => void) => () => void;
  };

  type CreateNavigatorController<C> = <Row>(options: ControllerOptions<Row, C>) => NavigatorController<Row, C>;

  type Element<C> = HTMLElement & {
    controller: NavigatorController<unknown, C> | undefined;
    density: Density;
    footer: FooterMode;
    striped: boolean;
    searchable: boolean;
    reloadable: boolean;
    selectableGroups: boolean;
    rowActionLook: RowActionLook;
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
