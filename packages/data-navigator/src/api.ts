import type { ReactElement, ReactNode } from 'react';

export type { DataNavigator };

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

  type ColumnFilter = (props: FilterProps) => ReactNode;

  type FilterOption = string | { value: string; label: string };

  type TextColumnFilterSettings = { placeholder?: string };

  type SelectColumnFilterSettings = { options: readonly FilterOption[]; multiple?: boolean };

  type Column<Row> = {
    key: keyof Row & string;
    header: ReactNode;
    width?: number;
    sortable?: boolean;
    align?: 'start' | 'center' | 'end';
    render?: (row: Row) => ReactNode;
    filter?: ColumnFilter;
    wrap?: boolean;
  };

  type ColumnGroup<Row> = {
    header: ReactNode;
    columns: readonly Column<Row>[];
  };

  type ActionVariant = 'primary' | 'secondary' | 'danger';

  type ActionLook =
    | { label: ReactNode; icon?: ReactNode; tip?: string }
    | { label?: undefined; icon: ReactNode; tip: string };

  type GeneralAction = {
    type: 'general';
    key: string;
    variant?: ActionVariant;
    onClick: () => void;
  } & ActionLook;

  type RowAction<Row> = {
    type: 'row';
    key: string;
    variant?: ActionVariant;
    onClick: (row: Row) => void;
    show?: 'column' | 'toolbar' | 'both';
    default?: boolean;
  } & ActionLook;

  type RowsAction<Row> = {
    type: 'rows';
    key: string;
    variant?: ActionVariant;
    onClick: (rows: readonly Row[]) => void;
  } & ActionLook;

  type Action<Row> = GeneralAction | RowAction<Row> | RowsAction<Row>;

  type ActionSeparator = { type: 'separator' };

  type ActionMenu<Row> = {
    type: 'menu';
    key: string;
    variant?: ActionVariant;
    actions: readonly (Action<Row> | ActionSeparator)[];
  } & ActionLook;

  type Props<Row> = {
    source: Source<Row>;
    rowKey: keyof Row & string;
    columns: readonly (Column<Row> | ColumnGroup<Row>)[];
    title?: ReactNode;
    subtitle?: ReactNode;
    selectionAppearance?: SelectionAppearance;
    density?: Density;
    striped?: boolean;
    renderDetail?: (row: Row) => ReactNode;
    empty?: ReactNode;
    actions?: readonly (Action<Row> | ActionMenu<Row>)[];
    pageSize?: number;
    pageSizeOptions?: readonly number[];
    defaultSort?: Sort;
    searchable?: boolean;
    controller?: Controller<Row>;
  };

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

  type Config = {
    i18n?: I18nAdapter;
    theme?: Theme;
  };

  type Component = <Row>(props: Props<Row>) => ReactElement;

  type Controller<Row> = {
    reload: () => void;
    clearRowSelection: () => void;
    getSelectedRows: () => readonly Row[];
  };
}
