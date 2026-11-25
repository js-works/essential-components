import i18next from 'i18next';
import ICU from 'i18next-icu';
import { useTranslation } from 'react-i18next';

import fileUploadDe from '@local/file-upload/locales/de.json' with { type: 'json' };
import fileUploadEn from '@local/file-upload/locales/en.json' with { type: 'json' };
import { i18nAdapterOf, microAppResources } from '@local/micro-app';

import { de } from './locales/de.js';
import { en } from './locales/en.js';

export type { TextKey, Translate };
export { i18n, i18nAdapter, translate, translateKey, useLanguage, useTranslate };

// The app's own translations, with i18next (its own instance, not the global one) and react-i18next: English and
// German, English is the default and the fallback. The texts are in the bundle (`locales/`), so the first render is
// translated. The language follows `<html lang>` (the page's language switch), observed.
//
// - In a component: `const t = useTranslate();` (it renders again when the language changes).
// - Outside a component (flows, toasts): `translate('key')`.
//
// The keys are flat (`'employees.title'`, no nesting: `keySeparator: false`) and typed by the English texts; `de.ts` must
// have the same ones. The texts are ICU messages (`i18next-icu`): `{name}` a value, a plural `{count, plural, one {…}
// other {…}}`, called with a `count`. No declaration of
// i18next's own types (`CustomTypeOptions`): it is global, and the Board Manager has one for its texts.

type TextKey = keyof typeof en;

type Translate = (key: TextKey, params?: Readonly<Record<string, unknown>>) => string;

const i18n = i18next.createInstance();

const pageLanguage = () => document.documentElement.lang || 'en';

void i18n.use(ICU).init({
  initAsync: false,
  lng: pageLanguage(),
  fallbackLng: 'en',
  supportedLngs: ['en', 'de'],
  nonExplicitSupportedLngs: true,
  defaultNS: 'app',
  keySeparator: false,
  resources: {
    en: { ...microAppResources.en, fileUpload: fileUploadEn, app: en },
    de: { ...microAppResources.de, fileUpload: fileUploadDe, app: de },
  },
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

// The adapter of the tier-1 packages (the file upload, form-validation, the overlays): `@local/micro-app`'s, over this
// instance.
const i18nAdapter = i18nAdapterOf(i18n);
