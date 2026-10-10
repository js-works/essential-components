import { useState, useSyncExternalStore } from 'react';
import type { DataTableComponent as Spec } from '../react/api';
import { createDataTableController, subscribeToSelection } from './controller';

export { useDataTableController, useDataTableSelection };

// A controller for one table, stable for the life of the component: `<DataTable controller={nav} />`, then
// `nav.reload()`, `nav.clearRowSelection()`, `nav.getSelectedRows()`.
function useDataTableController<Row>(): Spec.Controller<Row> {
  const [controller] = useState(() => createDataTableController<Row>());

  return controller;
}

// The selected rows of the table of a controller, re-rendering whenever they change (for UI that shows them). In an
// event handler, `controller.getSelectedRows()` is enough.
function useDataTableSelection<Row>(controller: Spec.Controller<Row>): readonly Row[] {
  return useSyncExternalStore(
    (listener) => subscribeToSelection(controller, listener),
    controller.getSelectedRows,
    controller.getSelectedRows,
  );
}
