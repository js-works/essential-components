import { useState } from 'react';
import type { ReactElement } from 'react';
import type { DataTableComponent } from '../src/react';
import type {
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
} from './controls';
import { Demo } from './Demo';

export { App };

function App(): ReactElement {
  const [theme, setTheme] = useState<DemoTheme>('default');
  const [actions, setActions] = useState<DemoActions>('multi-row');
  const [variants, setVariants] = useState<DemoVariants>('off');
  const [selectionAppearance, setSelectionAppearance] = useState<DataTableComponent.SelectionAppearance>('accent');
  const [rowActionLook, setRowActionLook] = useState<DataTableComponent.RowActionLook>('icon');
  const [density, setDensity] = useState<DataTableComponent.Density>('normal');
  const [layout, setLayout] = useState<DemoLayout>('user');
  const [footer, setFooter] = useState<DataTableComponent.FooterMode>('always');
  const [striped, setStriped] = useState<DemoStriped>('on');
  const [columns, setColumns] = useState<DemoColumns>('flat');
  const [filters, setFilters] = useState<DemoFilters>('on');
  const [data, setData] = useState<DemoData>('users');
  const [height, setHeight] = useState<DemoHeight>('fixed');

  const controls: Controls = {
    theme,
    setTheme,
    actions,
    setActions,
    variants,
    setVariants,
    selectionAppearance,
    setSelectionAppearance,
    rowActionLook,
    setRowActionLook,
    density,
    setDensity,
    layout,
    setLayout,
    footer,
    setFooter,
    striped,
    setStriped,
    filters,
    setFilters,
    columns,
    setColumns,
    data,
    setData,
    height,
    setHeight,
  };

  return <Demo controls={controls} />;
}
