import { useState } from 'react';
import type { ReactElement } from 'react';
import type { DataNavigatorComponent } from '../src/react';
import type {
  Controls,
  DemoActions,
  DemoColumns,
  DemoData,
  DemoFilters,
  DemoHeight,
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
  const [selectionAppearance, setSelectionAppearance] = useState<DataNavigatorComponent.SelectionAppearance>('neutral');
  const [density, setDensity] = useState<DataNavigatorComponent.Density>('normal');
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
    density,
    setDensity,
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
