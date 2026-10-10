import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import type { I18nAdapter } from '../../../../../packages/form-validation/src';
import { de } from './locales/de';
import { en } from './locales/en';

export { i18nAdapter, translate, translateKey, useLanguage, useTranslate };
export type { TextKey, Translate };

// The app's own translations, with i18next (its own instance, not the global one) and react-i18next: English and
// German, English is the default and the fallback. The texts are in the bundle (`locales/`), so the first render is
// translated. The language follows `<html lang>` (the page's language switch), observed.
//
// - In a component: `const t = useTranslate();` (it renders again when the language changes).
// - Outside a component (flows, toasts): `translate('key')`.
//
// The keys are flat (`'employees.title'`, no nesting: `keySeparator: false`) and typed by the English texts; `de.ts` must
// have the same ones. Plurals are i18next's: `key_one`, `key_other`, called as `key` with a `count`. No declaration of
// i18next's own types (`CustomTypeOptions`): it is global, and the Board Manager has one for its texts.

type StripPlural<K> = K extends `${infer Base}_one` ? Base : K extends `${infer Base}_other` ? Base : K;

type TextKey = StripPlural<keyof typeof en>;

type Translate = (key: TextKey, params?: Readonly<Record<string, unknown>>) => string;

const i18n = i18next.createInstance();

const pageLanguage = () => document.documentElement.lang || 'en';

void i18n.init({
  initAsync: false,
  lng: pageLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'de'],
  nonExplicitSupportedLngs: true,
  ns: ['app'],
  defaultNS: 'app',
  keySeparator: false,
  resources: { en: { app: en }, de: { app: de } },
  interpolation: { escapeValue: false }, // React escapes
});

// Every change of `<html lang>` is a change of the language.
new MutationObserver(() => void i18n.changeLanguage(pageLanguage())).observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['lang'],
});

// Untyped by i18next (no declaration of its types, see above): the keys are checked by `TextKey`.
const resolve = i18n.t.bind(i18n) as unknown as (key: string, options?: object) => string;

const translate: Translate = (key, params) => resolve(key, { ...params });

// The instance is given to the hook, no provider needed: it also works where the component is rendered by the overlays
// package (dialogs, toasts), whatever React context is there.
function useTranslate(): Translate {
  const { i18n: instance } = useTranslation('app', { i18n, useSuspense: false });

  // A new function with each language, so a memo that depends on it follows the language.
  return translatorFor(instance.language);
}

const translators = new Map<string, Translate>();

function translatorFor(language: string): Translate {
  let translator = translators.get(language);

  if (translator === undefined) {
    translator = (key, params) => resolve(key, { ...params, lng: language });
    translators.set(language, translator);
  }

  return translator;
}

// The current language (`en`, `de`), e.g. for the dates of Mantine.
function useLanguage(): string {
  return useTranslation('app', { i18n, useSuspense: false }).i18n.language;
}

// A text by a key that is only known at run time (an error's key and values): untyped, the caller has checked the key.
function translateKey(key: string, params?: object): string {
  return resolve(key, { ...params });
}

// The adapter of the components (form-validation): a namespace i18next does not know (e.g. 'formValidation') gives the
// `defaultValue`, the text of the component.
const i18nAdapter: I18nAdapter = {
  currentLocale: () => i18n.language,
  resolveText: (namespace, key, params, defaultValue) => resolve(key, { ns: namespace, ...params, defaultValue }),
  onChange: (listener) => {
    i18n.on('languageChanged', listener);

    return () => i18n.off('languageChanged', listener);
  },
};
