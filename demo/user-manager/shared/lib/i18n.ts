import { createInstance } from 'i18next';

import { microAppResources } from '@local/micro-app';

export { i18n };

// The app's i18next instance (its own, not the global one), for the building blocks' texts (`@local/micro-app`). The app
// is English only: its own texts are in its code, and the instance stays English whatever `<html lang>` says.
const i18n = createInstance();

void i18n.init({
  initAsync: false,
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: microAppResources.en },
  interpolation: { escapeValue: false },
});
