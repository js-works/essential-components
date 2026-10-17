import type { i18n as I18nInstance } from 'i18next';
import type { ReactNode } from 'react';

import type { SavedFilterStore } from '@local/data-table/react';

export type { MicroAppProviderProps };

type MicroAppProviderProps = {
  i18n: I18nInstance;
  savedFilters?: SavedFilterStore;
  children: ReactNode;
};
