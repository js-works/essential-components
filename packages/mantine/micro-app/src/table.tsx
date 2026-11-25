import type { ReactElement } from 'react';

import type { DataTableProps, SavedFilters } from '@local/data-table/react';
import { createDataTableComponent, useSavedFilters } from '@local/data-table/react';
import { mantineTheme } from '@local/data-table/themes';

import { useI18nAdapter } from './i18n-adapter.js';
import { useSavedFilterStore } from './provider.js';

export { DataTable, useSavedTableFilters };

const BaseTable = createDataTableComponent({ useI18n: useI18nAdapter, theme: mantineTheme });

// The data table of a micro-app: in Mantine's look, compact, the footer only when there is something to page, the
// number of rows after the title, 50 rows a page, unless a table says otherwise. In a `micro-app__table` without a
// box of its own (`display: contents`): the hook of the layout that lets a page's table fill the height below the
// header.
function DataTable<Row>(props: DataTableProps<Row>): ReactElement {
  return (
    <div className="micro-app__table">
      <BaseTable density="compact" footer="auto" showTotal defaultPageSize={50} {...props} />
    </div>
  );
}

// The saved filters of one of the main tables (`table`: its name, e.g. `users`), for the data table's `savedFilters`,
// from the store given to the `MicroAppProvider`.
function useSavedTableFilters(table: string): SavedFilters {
  return useSavedFilters(useSavedFilterStore(), table);
}
