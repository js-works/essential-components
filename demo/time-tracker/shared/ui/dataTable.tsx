import type { ReactElement } from 'react';
import { i18n as tableI18n } from '../../../../packages/data-table/demo/i18n';
import { createDataTableComponent } from '../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import { mantineTheme } from '../../../../packages/data-table/src/themes';

export { DataTable };

// The data table of the app, in Mantine's look. It follows `<html lang>` through the i18n adapter of its demo.
const BaseDataTable = createDataTableComponent({ i18n: tableI18n, theme: mantineTheme });

// Every table in a `time-tracker__table`, which has no box of its own (`display: contents`): the hook of the layout
// that lets the table of a page fill the height below the app header (`time-tracker.css`), like the Board Manager's. The
// footer only when there is something to page, the number of rows after the title, and 50 rows a page (2026-10-08, the
// user's wish, in every app), unless a table says otherwise.
function DataTable<Row>(props: DataTableComponent.Props<Row>): ReactElement {
  return (
    <div className="time-tracker__table">
      <BaseDataTable footer="auto" showTotal pageSize={50} {...props} />
    </div>
  );
}
