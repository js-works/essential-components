import { createInstance } from 'i18next';
import ICU from 'i18next-icu';

import { i18nAdapterOf, microAppResources } from '@local/micro-app';

export { i18n, i18nAdapter };

// The app's i18next instance (its own, not the global one), for the building blocks' texts (`@local/micro-app`). The app
// is English only: its own texts are in its code, and the instance stays English whatever `<html lang>` says.
const i18n = createInstance();

void i18n.use(ICU).init({
  initAsync: false,
  lng: 'en',
  fallbackLng: 'en',
  resources: { en: microAppResources.en },
  interpolation: { escapeValue: false },
});

// The adapter of the tier-1 packages (the overlays): `@local/micro-app`'s, over this instance.
const i18nAdapter = i18nAdapterOf(i18n);
