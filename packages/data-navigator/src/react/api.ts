import type { ReactElement, ReactNode } from 'react';
import type { DataNavigator } from '../api';

export type { DataNavigatorComponent };

declare namespace DataNavigatorComponent {
  type SortDirection = DataNavigator.SortDirection;

  type SelectionMode = DataNavigator.SelectionMode;

  type Density = DataNavigator.Density;

  type SelectionAppearance = DataNavigator.SelectionAppearance;

  type Sort = DataNavigator.Sort;

  type FilterValue = DataNavigator.FilterValue;

  type Query = DataNavigator.Query;

  type Result<Row> = DataNavigator.Result<Row>;

  type Source<Row> = DataNavigator.Source<Row>;

  type FilterProps = DataNavigator.FilterProps;

  type FilterOption = DataNavigator.FilterOption;

  type TextColumnFilterSettings = DataNavigator.TextColumnFilterSettings;

  type SelectColumnFilterSettings = DataNavigator.SelectColumnFilterSettings;

  type DateRangeFilterValue = DataNavigator.DateRangeFilterValue;

  type ColumnAlign = DataNavigator.ColumnAlign;

  type ActionVariant = DataNavigator.ActionVariant;

  type ActionSeparator = DataNavigator.ActionSeparator;

  type Texts = DataNavigator.Texts;

  type ThemeValue = DataNavigator.ThemeValue;

  type Theme = DataNavigator.Theme;

  type I18nAdapter = DataNavigator.I18nAdapter;

  type ColumnFilter = (props: FilterProps) => ReactNode;

  type Column<Row> = {
    key: keyof Row & string;
    header: ReactNode;
    width?: number;
    sortable?: boolean;
    align?: ColumnAlign;
    render?: (row: Row) => ReactNode;
    filter?: ColumnFilter;
    wrap?: boolean;
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
