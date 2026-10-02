import type { ReactElement, ReactNode } from 'react';
import type { DataNavigator } from '../api';

export type { DataNavigatorComponent };

declare namespace DataNavigatorComponent {
  type SortDirection = DataNavigator.SortDirection;

  type SelectionMode = DataNavigator.SelectionMode;

  type Density = DataNavigator.Density;

  type FooterMode = DataNavigator.FooterMode;

  type SelectionAppearance = DataNavigator.SelectionAppearance;

  type RowActionLook = DataNavigator.RowActionLook;

  type Sort = DataNavigator.Sort;

  type FilterValue = DataNavigator.FilterValue;

  type Query = DataNavigator.Query;

  type Result<Row> = DataNavigator.Result<Row>;

  type ResultGroup = DataNavigator.ResultGroup;

  type GroupBy<Row> = DataNavigator.GroupBy<Row>;

  type RowGroup<Row> = DataNavigator.RowGroup<Row>;

  type Source<Row> = DataNavigator.Source<Row>;

  type Move<Row> = DataNavigator.Move<Row>;

  type Reorder<Row> = DataNavigator.Reorder<Row>;

  type SaveRow<Row> = DataNavigator.SaveRow<Row>;

  type CreateRow<Row> = DataNavigator.CreateRow<Row>;

  type EditorProps<Row> = DataNavigator.EditorProps<Row>;

  type TextColumnEditorSettings = DataNavigator.TextColumnEditorSettings;

  type SelectColumnEditorSettings = DataNavigator.SelectColumnEditorSettings;

  type DateColumnEditorSettings = DataNavigator.DateColumnEditorSettings;

  type FilterProps = DataNavigator.FilterProps;

  type FilterOption = DataNavigator.FilterOption;

  type TextColumnFilterSettings = DataNavigator.TextColumnFilterSettings;

  type TextFilterMatch = DataNavigator.TextFilterMatch;

  type TextFilterValue = DataNavigator.TextFilterValue;

  type SelectColumnFilterSettings = DataNavigator.SelectColumnFilterSettings;

  type AutocompleteOption = { value: string; label: string; content?: () => ReactNode };

  type AutocompleteColumnFilterSettings = {
    load: (query: string, signal: AbortSignal) => Promise<readonly AutocompleteOption[]>;
    multiple?: boolean;
    minQueryLength?: number;
    maxChips?: number;
  };

  type DateRangeFilterValue = DataNavigator.DateRangeFilterValue;

  type NumberRangeFilterValue = DataNavigator.NumberRangeFilterValue;

  type ColumnAlign = DataNavigator.ColumnAlign;

  type ActionVariant = DataNavigator.ActionVariant;

  type ActionSeparator = DataNavigator.ActionSeparator;

  type Texts = DataNavigator.Texts;

  type ThemeValue = DataNavigator.ThemeValue;

  type Theme = DataNavigator.Theme;

  type I18nAdapter = DataNavigator.I18nAdapter;

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
    searchable?: boolean;
    reloadable?: boolean;
    selectableGroups?: boolean;
    rowActionLook?: RowActionLook;
    controller?: Controller<Row>;
  };

  type Config = {
    i18n?: NonNullable<DataNavigator.SetupConfig['i18n']> | { type: 'hook'; useAdapter: () => I18nAdapter };
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
