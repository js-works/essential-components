import type { DataNavigator } from '../src';

export type {
  Controls,
  DemoActions,
  DemoColumns,
  DemoData,
  DemoFilters,
  DemoHeight,
  DemoStriped,
  DemoTheme,
  DemoVariants,
};

// The theme of the table.
type DemoTheme = 'default' | 'mantine' | 'antd';

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
type Controls = {
  theme: DemoTheme;
  setTheme: (theme: DemoTheme) => void;
  actions: DemoActions;
  setActions: (actions: DemoActions) => void;
  variants: DemoVariants;
  setVariants: (variants: DemoVariants) => void;
  selectionAppearance: DataNavigator.SelectionAppearance;
  setSelectionAppearance: (appearance: DataNavigator.SelectionAppearance) => void;
  density: DataNavigator.Density;
  setDensity: (density: DataNavigator.Density) => void;
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
