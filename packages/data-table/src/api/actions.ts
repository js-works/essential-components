import type { TextContent } from './content.js';
import type { RowGroup } from './query.js';
import type { ActionSeparator, ActionVariant } from './settings.js';

export type { ActionLook, ActionMenu, GeneralAction, GroupAction, RowAction, RowsAction, TableAction };

type ActionLook<C> =
  | { label: TextContent<C>; icon?: () => C; tip?: string | (() => string) }
  | { label?: undefined; icon: () => C; tip: string | (() => string) };

type GeneralAction<C> = {
  type: 'general';
  key: string;
  variant?: ActionVariant;
  contextMenu?: boolean;
  pinned?: boolean;
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
  visible?: (row: Row) => boolean;
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

type TableAction<Row, C> = GeneralAction<C> | RowAction<Row, C> | RowsAction<Row, C> | GroupAction<Row, C>;

type ActionMenu<Row, C> = {
  type: 'menu';
  key: string;
  variant?: ActionVariant;
  chevron?: boolean;
  actions: readonly (TableAction<Row, C> | ActionSeparator)[];
} & ActionLook<C>;
