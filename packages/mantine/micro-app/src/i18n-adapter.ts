import type { i18n as I18nInstance } from 'i18next';
import { useTranslation } from 'react-i18next';

import type { I18nAdapter } from '@local/form-validation';

export { i18nAdapterOf, useI18nAdapter };

const adapters = new WeakMap<I18nInstance, I18nAdapter>();

// The `I18nAdapter` of the tier-1 packages (`frontend/i18n.md`) over an app's i18next instance (with ICU): the
// translation of the key in its namespace, `null` without one (`t()` would give the key itself), so the package uses
// its English text. Its `onChange` reports a change of the language and the arrival of a namespace loaded later. One
// per instance, the same object every time.
function i18nAdapterOf(i18n: I18nInstance): I18nAdapter {
  let adapter = adapters.get(i18n);

  if (adapter === undefined) {
    adapter = {
      currentLocale: () => i18n.language,
      // `null`: the app's default namespace (i18next's `defaultNS`).
      translate: (namespace, key, params) => {
        const ns = namespace ?? undefined;

        return i18n.exists(key, { ns } as never)
          ? String(i18n.t(key, { ns, ...params, interpolation: { escapeValue: false } } as never))
          : null;
      },
      onChange: (listener) => {
        i18n.on('languageChanged', listener);
        i18n.on('loaded', listener);

        return () => {
          i18n.off('languageChanged', listener);
          i18n.off('loaded', listener);
        };
      },
    };
    adapters.set(i18n, adapter);
  }

  return adapter;
}

// The adapter of the app's i18next instance (its `I18nextProvider`, e.g. `MicroAppProvider`), for a package's
// `useI18n`: `createDataTableComponent({ useI18n: useI18nAdapter })`.
function useI18nAdapter(): I18nAdapter {
  const { i18n } = useTranslation();

  return i18nAdapterOf(i18n);
}
