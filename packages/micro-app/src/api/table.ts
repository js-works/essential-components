export type { TableActionOptions };

type TableActionOptions<Row = never> = {
  key?: string;
  label?: string;
  tip?: string;
  show?: 'column' | 'toolbar' | 'both';
  default?: boolean;
  contextMenu?: boolean;
  visible?: (row: Row) => boolean;
};
