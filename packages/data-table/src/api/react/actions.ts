import type { ReactNode } from 'react';
import type { RowGroup } from '../query.js';
import type { ActionSeparator, ActionVariant } from '../settings.js';

export type { ActionLook, ActionMenu, GeneralAction, GroupAction, RowAction, RowsAction, TableAction };

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

type TableAction<Row> = GeneralAction | RowAction<Row> | RowsAction<Row> | GroupAction<Row>;

type ActionMenu<Row> = {
  type: 'menu';
  key: string;
  variant?: ActionVariant;
  chevron?: boolean;
  actions: readonly (TableAction<Row> | ActionSeparator)[];
} & ActionLook;
