import type { FooterMode, RowActionLook, SelectionAppearance, TableDensity, TableLayout } from '../src/react/index.js';

export type {
  Controls,
  DemoActions,
  DemoColumns,
  DemoData,
  DemoFilters,
  DemoHeight,
  DemoLayout,
  DemoStriped,
  DemoTheme,
  DemoVariants,
};

// The theme of the table.
type DemoTheme = 'default' | 'soft' | 'mantine' | 'antd';

type DemoHeight = 'auto' | 'fixed';

type DemoColumns = 'flat' | 'grouped';

type DemoData = 'users' | 'empty' | 'custom';

type DemoFilters = 'off' | 'on';

type DemoStriped = 'off' | 'on';

// Whether the demo actions use the variants: "Add user" primary, the deletes danger. Off: all secondary.
type DemoVariants = 'off' | 'on';

// Which actions the demo has. They decide the selection mode: none, single (radio buttons) or multi (checkboxes).
type DemoActions = 'general' | 'single-row' | 'multi-row';

// The settings of the demo.
// `user`: the app sets no layout, the user chooses it in the column menu.
type DemoLayout = 'user' | TableLayout;

type Controls = {
  theme: DemoTheme;
  setTheme: (theme: DemoTheme) => void;
  actions: DemoActions;
  setActions: (actions: DemoActions) => void;
  variants: DemoVariants;
  setVariants: (variants: DemoVariants) => void;
  selectionAppearance: SelectionAppearance;
  rowActionLook: RowActionLook;
  setRowActionLook: (look: RowActionLook) => void;
  setSelectionAppearance: (appearance: SelectionAppearance) => void;
  density: TableDensity;
  setDensity: (density: TableDensity) => void;
  layout: DemoLayout;
  setLayout: (layout: DemoLayout) => void;
  footer: FooterMode;
  setFooter: (footer: FooterMode) => void;
  striped: DemoStriped;
  setStriped: (striped: DemoStriped) => void;
  filters: DemoFilters;
  setFilters: (filters: DemoFilters) => void;
  columns: DemoColumns;
  setColumns: (columns: DemoColumns) => void;
  data: DemoData;
  setData: (data: DemoData) => void;
  height: DemoHeight;
  setHeight: (height: DemoHeight) => void;
};
