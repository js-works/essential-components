import { useState, useSyncExternalStore } from 'react';
import type { DataNavigatorComponent as Spec } from '../react/api';
import { createDataNavigatorController, subscribeToSelection } from './controller';

export { useDataNavigatorController, useDataNavigatorSelection };

// A controller for one table, stable for the life of the component: `<DataNavigator controller={nav} />`, then
// `nav.reload()`, `nav.clearRowSelection()`, `nav.getSelectedRows()`.
function useDataNavigatorController<Row>(): Spec.Controller<Row> {
  const [controller] = useState(() => createDataNavigatorController<Row>());

  return controller;
}

// The selected rows of the table of a controller, re-rendering whenever they change (for UI that shows them). In an
// event handler, `controller.getSelectedRows()` is enough.
function useDataNavigatorSelection<Row>(controller: Spec.Controller<Row>): readonly Row[] {
  return useSyncExternalStore(
    (listener) => subscribeToSelection(controller, listener),
    controller.getSelectedRows,
    controller.getSelectedRows,
  );
}
