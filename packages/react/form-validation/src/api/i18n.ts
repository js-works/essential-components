export type { I18nAdapter, TextParams };

// A verbatim copy of the types in `packages/ai/instructions/frontend/i18n.md`: change them there first, then here.

/**
 * The app's i18n system, as a library sees it. The app writes one adapter and gives it to every library that has texts.
 */
interface I18nAdapter {
  /** The current locale, e.g. `'de-DE'`. */
  currentLocale: () => string;
  /**
   * The translation of a key in the current language, or `null` when there is none: then the library uses its own
   * English text. `namespace`: the library's (its name in camelCase, e.g. `'formValidation'`) or one the app names for
   * its own keys. `params`: the raw values (numbers, dates), `null` for none; the translation formats them and picks
   * the plural (by `count`).
   */
  translate: (namespace: string, key: string, params: Readonly<Record<string, unknown>> | null) => string | null;
  /** Reports a change of the language; returns the function that ends the subscription. */
  onChange?: (listener: () => void) => () => void;
}

/**
 * The values of each text of a library's English texts (functions of their values and the locale):
 * `TextParams<typeof EN>` gives `{ 'number.min': { min: number }, … }`.
 */
type TextParams<T> = { [K in keyof T]: T[K] extends (params: infer P, locale: string) => string ? P : never };
