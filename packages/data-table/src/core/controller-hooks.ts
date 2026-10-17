import { useState, useSyncExternalStore } from 'react';

import type * as Spec from '../api/react/index.js';
import { createDataTableController, subscribeToSelection } from './controller.js';

export { useDataTableController, useDataTableSelection };

// A controller for one table, stable for the life of the component: `<DataTable controller={nav} />`, then
// `nav.reload()`, `nav.clearRowSelection()`, `nav.getSelectedRows()`.
function useDataTableController<Row>(): Spec.TableController<Row> {
  const [controller] = useState(() => createDataTableController<Row>());

  return controller;
}

// The selected rows of the table of a controller, re-rendering whenever they change (for UI that shows them). In an
// event handler, `controller.getSelectedRows()` is enough.
function useDataTableSelection<Row>(controller: Spec.TableController<Row>): readonly Row[] {
  return useSyncExternalStore(
    (listener) => subscribeToSelection(controller, listener),
    controller.getSelectedRows,
    controller.getSelectedRows,
  );
}
