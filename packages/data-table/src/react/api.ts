import type { ReactElement, ReactNode } from 'react';
import type { DataTable } from '../api';

export type { DataTableComponent };

declare namespace DataTableComponent {
  type SortDirection = DataTable.SortDirection;

  type SelectionMode = DataTable.SelectionMode;

  type Density = DataTable.Density;

  type FooterMode = DataTable.FooterMode;

  type Layout = DataTable.Layout;

  type SelectionAppearance = DataTable.SelectionAppearance;

  type RowActionLook = DataTable.RowActionLook;

  type Sort = DataTable.Sort;

  type FilterValue = DataTable.FilterValue;

  type Query = DataTable.Query;

  type Result<Row> = DataTable.Result<Row>;

  type ResultGroup = DataTable.ResultGroup;

  type GroupBy<Row> = DataTable.GroupBy<Row>;

  type RowGroup<Row> = DataTable.RowGroup<Row>;

  type Source<Row> = DataTable.Source<Row>;

  type Move<Row> = DataTable.Move<Row>;

  type Reorder<Row> = DataTable.Reorder<Row>;

  type SaveRow<Row> = DataTable.SaveRow<Row>;

  type CreateRow<Row> = DataTable.CreateRow<Row>;

  type EditorProps<Row> = DataTable.EditorProps<Row>;

  type TextColumnEditorSettings = DataTable.TextColumnEditorSettings;

  type SelectColumnEditorSettings = DataTable.SelectColumnEditorSettings;

  type DateColumnEditorSettings = DataTable.DateColumnEditorSettings;

  type FilterProps = DataTable.FilterProps;

  type FilterOption = DataTable.FilterOption;

  type TextColumnFilterSettings = DataTable.TextColumnFilterSettings;

  type TextFilterMatch = DataTable.TextFilterMatch;

  type TextFilterValue = DataTable.TextFilterValue;

  type SelectColumnFilterSettings = DataTable.SelectColumnFilterSettings;

  type AutocompleteOption = { value: string; label: string; content?: () => ReactNode };

  type AutocompleteColumnFilterSettings = {
    load: (query: string, signal: AbortSignal) => Promise<readonly AutocompleteOption[]>;
    multiple?: boolean;
    minQueryLength?: number;
    maxChips?: number;
  };

  type DateRangeFilterValue = DataTable.DateRangeFilterValue;

  type NumberRangeFilterValue = DataTable.NumberRangeFilterValue;

  type ColumnAlign = DataTable.ColumnAlign;

  type ActionVariant = DataTable.ActionVariant;

  type ActionSeparator = DataTable.ActionSeparator;

  type Texts = DataTable.Texts;

  type ThemeValue = DataTable.ThemeValue;

  type Theme = DataTable.Theme;

  type I18nAdapter = DataTable.I18nAdapter;

  type ColumnFilter = (props: FilterProps) => ReactNode;

  type ColumnEditor<Row> = (props: EditorProps<Row>) => ReactNode;

  type EditField<Row> = {
    key: keyof Row & string;
    label: ReactNode;
    edit: ColumnEditor<Row>;
  };

  type Column<Row> = {
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
    columns: readonly Column<Row>[];
  };

  type ActionLook =
    | { label: ReactNode; icon?: ReactNode; tip?: string }
    | { label?: undefined; icon: ReactNode; tip: string };

  type GeneralAction = {
    type: 'general';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    pinned?: boolean;
    onClick: () => void;
  } & ActionLook;

  type RowAction<Row> = {
    type: 'singleRow';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    onClick: (row: Row) => void;
    show?: 'column' | 'toolbar' | 'both';
    default?: boolean;
    visible?: (row: Row) => boolean;
  } & ActionLook;

  type RowsAction<Row> = {
    type: 'multiRow';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    onClick: (rows: readonly Row[]) => void;
  } & ActionLook;

  type GroupAction<Row> = {
    type: 'group';
    key: string;
    variant?: ActionVariant;
    contextMenu?: boolean;
    onClick: (group: RowGroup<Row>) => void;
  } & ActionLook;

  type Action<Row> = GeneralAction | RowAction<Row> | RowsAction<Row> | GroupAction<Row>;

  type ActionMenu<Row> = {
    type: 'menu';
    key: string;
    variant?: ActionVariant;
    actions: readonly (Action<Row> | ActionSeparator)[];
  } & ActionLook;

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
  };

  type Config = {
    i18n?: NonNullable<DataTable.SetupConfig['i18n']> | { type: 'hook'; useAdapter: () => I18nAdapter };
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
}
