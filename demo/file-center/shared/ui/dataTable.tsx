import type { ReactElement } from 'react';
import { i18n as tableI18n } from '../../../../packages/data-table/demo/i18n';
import { createDataTableComponent } from '../../../../packages/data-table/src/react';
import type { DataTableComponent } from '../../../../packages/data-table/src/react';
import { mantineTheme } from '../../../../packages/data-table/src/themes';

export { DataTable };

// The data table of the app, in Mantine's look. It follows `<html lang>` through the i18n adapter of its demo.
const BaseDataTable = createDataTableComponent({ i18n: tableI18n, theme: mantineTheme });

// The table is compact (2026-10-07, the user's wish, like the User Manager's), unless it says otherwise. In a
// `file-center__table`, which has no box of its own (`display: contents`): the hook of the layout that lets the table
// fill the height below the app header (`file-center.css`), like the Board Manager's. The footer only when there is
// something to page, and the number of rows after the title (2026-10-07, the user's wish, like the Time Tracker's). 50
// rows a page (2026-10-08, the user's wish, in every app), unless a table says otherwise.
function DataTable<Row>(props: DataTableComponent.Props<Row>): ReactElement {
  return (
    <div className="file-center__table">
      <BaseDataTable density="compact" footer="auto" showTotal pageSize={50} {...props} />
    </div>
  );
}
