import type { ReactElement } from 'react';
import { createContext, useContext } from 'react';
import { I18nextProvider } from 'react-i18next';

import type { SavedFilterStore } from '@local/data-table/react';

import type { MicroAppProviderProps } from './api/provider.js';

export { MicroAppProvider, useSavedFilterStore };

const SavedFilterContext = createContext<SavedFilterStore | undefined>(undefined);

// What the building blocks get from the app, around the whole app: its i18next instance (for the texts, `microApp` and
// `dataTable`) and the store of the tables' saved filters.
function MicroAppProvider({ i18n, savedFilters, children }: MicroAppProviderProps): ReactElement {
  return (
    <I18nextProvider i18n={i18n}>
      <SavedFilterContext.Provider value={savedFilters}>{children}</SavedFilterContext.Provider>
    </I18nextProvider>
  );
}

function useSavedFilterStore(): SavedFilterStore {
  const store = useContext(SavedFilterContext);

  if (store === undefined) {
    throw new Error('useSavedTableFilters: no `savedFilters` given to the MicroAppProvider around it.');
  }

  return store;
}
