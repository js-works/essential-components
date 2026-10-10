import type { ReactElement } from 'react';
import { i18n as tableI18n } from '../../../../packages/data-table/demo/i18n';
import { createDataTableComponent } from '../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import { mantineTheme } from '../../../../packages/data-table/src/themes';

export { DataTable };

// The data table of the app, in Mantine's look. It follows `<html lang>` through the i18n adapter of its demo.
const BaseDataTable = createDataTableComponent({ i18n: tableI18n, theme: mantineTheme });

// Every table of the app is compact (2026-10-06, the user's wish), unless a table says otherwise. In a
// `user-manager__table`, which has no box of its own (`display: contents`): the hook of the layout that lets the table
// of a page fill the height below the app header (`user-manager.css`, 2026-10-08), like the Board Manager's. 50 rows a
// page (2026-10-08, the user's wish, in every app), unless a table says otherwise.
function DataTable<Row>(props: DataTableComponent.Props<Row>): ReactElement {
  return (
    <div className="user-manager__table">
      <BaseDataTable density="compact" pageSize={50} {...props} />
    </div>
  );
}
