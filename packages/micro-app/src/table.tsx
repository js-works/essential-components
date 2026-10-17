import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { DataTableProps, I18nAdapter, SavedFilters } from '@local/data-table/react';
import { createDataTableComponent, useSavedFilters } from '@local/data-table/react';
import { mantineTheme } from '@local/data-table/themes';

import { useSavedFilterStore } from './provider.js';

export { DataTable, useSavedTableFilters };

// The data table's texts from the app's i18next instance (the namespace `dataTable`; the German ones are the package's
// resources): a translation of the language (`de` for `de-DE`) with its `{name}` placeholders filled in (numbers in the
// locale), else the data table's English default.
function useAdapter(): I18nAdapter {
  const { i18n } = useTranslation();

  return useMemo(
    () => ({
      currentLocale: () => i18n.language,
      resolveText: (namespace, key, params, defaultValue) => {
        const language = i18n.language.split('-')[0] ?? '';
        const text = i18n.getResource(language, namespace, key) as unknown;

        if (typeof text !== 'string') {
          return defaultValue;
        }

        return text.replace(/\{(\w+)\}/g, (_, name: string) => {
          const value = params?.[name];

          return typeof value === 'number' ? new Intl.NumberFormat(i18n.language).format(value) : String(value);
        });
      },
      onChange: (listener) => {
        i18n.on('languageChanged', listener);

        return () => i18n.off('languageChanged', listener);
      },
    }),
    [i18n],
  );
}

const BaseTable = createDataTableComponent({ i18n: { type: 'hook', useAdapter }, theme: mantineTheme });

// The data table of a micro-app: in Mantine's look, compact, the footer only when there is something to page, the
// number of rows after the title, 50 rows a page, unless a table says otherwise. In a `micro-app__table` without a
// box of its own (`display: contents`): the hook of the layout that lets a page's table fill the height below the
// header.
function DataTable<Row>(props: DataTableProps<Row>): ReactElement {
  return (
    <div className="micro-app__table">
      <BaseTable density="compact" footer="auto" showTotal pageSize={50} {...props} />
    </div>
  );
}

// The saved filters of one of the main tables (`table`: its name, e.g. `users`), for the data table's `savedFilters`,
// from the store given to the `MicroAppProvider`.
function useSavedTableFilters(table: string): SavedFilters {
  return useSavedFilters(useSavedFilterStore(), table);
}
