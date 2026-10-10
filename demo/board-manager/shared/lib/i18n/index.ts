import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import type { I18nAdapter } from '../../../../../packages/form-validation/src';
import { de } from './locales/de';
import { en } from './locales/en';

export { i18n, i18nAdapter, translate, translateKey, useLanguage, useTranslate };
export type { Translate };

// The app's own translations, with i18next (its own instance, not the global one) and react-i18next: English and
// German, English is the default and the fallback. The texts are in the bundle (`locales/`), so the first render is
// translated, nothing is loaded on demand. The language follows `<html lang>` (the page's language switch), observed.
//
// - In a component: `const t = useTranslate();` (it renders again when the language changes).
// - Outside a component (the PDF, flows, the fake server's errors): `translate('key')`.
// The keys are typed by the English texts, and `de.ts` must have the same ones.

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'app';
    resources: { app: typeof en };
  }
}

const i18n = i18next.createInstance();

const pageLanguage = () => document.documentElement.lang || 'en';

void i18n.init({
  // The resources are inline, so `init` finishes synchronously.
  initAsync: false,
  lng: pageLanguage(),
  fallbackLng: 'en',
  // Only these two; `de-DE` and `en-US` are `de` and `en`.
  supportedLngs: ['en', 'de'],
  nonExplicitSupportedLngs: true,
  ns: ['app'],
  defaultNS: 'app',
  resources: { en: { app: en }, de: { app: de } },
  interpolation: { escapeValue: false }, // React escapes
});

// Every change of `<html lang>` is a change of the language.
new MutationObserver(() => void i18n.changeLanguage(pageLanguage())).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang'],
});

// The instance is given to the hook, no provider needed: it also works where the component is rendered by the overlays
// package (dialogs, toasts) or in the shadow root of the element, whatever React context is there.
function useTranslate() {
  return useTranslation('app', { i18n, useSuspense: false }).t;
}

// The current language (a component that has to render again, or that passes it on, e.g. `OverlaysProvider`).
function useLanguage(): string {
  return useTranslation('app', { i18n, useSuspense: false }).i18n.language;
}

type Translate = ReturnType<typeof useTranslate>;

const translate: Translate = i18n.t.bind(i18n);

// The adapter of the components (here form-validation): a namespace i18next does not know (e.g. 'formValidation')
// gives the `defaultValue`, the text of the component. Its keys are strings, not the app's typed ones.
const resolve = i18n.t.bind(i18n) as (key: string, options: object) => string;

// A text by a key that is only known at run time (an error's key and values): untyped, the caller has checked the key.
function translateKey(key: string, params?: object): string {
  return resolve(key, { ...params });
}

const i18nAdapter: I18nAdapter = {
  currentLocale: () => i18n.language,
  resolveText: (namespace, key, params, defaultValue) => resolve(key, { ns: namespace, ...params, defaultValue }),
  onChange: (listener) => {
    i18n.on('languageChanged', listener);

    return () => i18n.off('languageChanged', listener);
  },
};
