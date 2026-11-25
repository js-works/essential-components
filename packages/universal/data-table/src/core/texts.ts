import { useContext, useEffect, useMemo, useState } from 'react';

import type { DataTableTextKey } from '../api/react/index.js';
import { EN } from '../texts/en.js';
import { ConfigContext } from './config.js';

export type { Texts };
export { useLocale, useTexts };

// The namespace of our texts in an `I18nAdapter`.
const NAMESPACE = 'dataTable';

const FALLBACK_LOCALE = 'en-US';

const KEYS = Object.keys(EN) as DataTableTextKey[];

// The texts of one render: a string for a text without values, else a function of them.
type Texts = {
  readonly [K in DataTableTextKey]: Parameters<(typeof EN)[K]>[0] extends infer P
    ? undefined extends P ? string : (params: P) => string
    : never;
};

// An invalid tag falls back to en-US instead of throwing.
function validLocale(locale: string): string {
  try {
    new Intl.NumberFormat(locale);

    return locale;
  } catch {
    return FALLBACK_LOCALE;
  }
}

// The locale the texts are in: the adapter's, else en-US (`i18n.md`). For formatting of our own (e.g. dates with `Intl`).
function useLocale(): string {
  const { i18n } = useContext(ConfigContext);

  return validLocale(i18n?.currentLocale() ?? FALLBACK_LOCALE);
}

// The texts come from the `I18nAdapter` of the configuration (namespace "dataTable"): it gets the key and the raw
// params, and returns the translation, or `null`: then the English text (`texts/en.ts`), formatted in the adapter's
// locale. Without an adapter, the English texts in en-US. The component re-renders when the adapter reports a change.
function useTexts(): Texts {
  const { i18n } = useContext(ConfigContext);
  const [version, setVersion] = useState(0);

  useEffect(() => i18n?.onChange?.(() => setVersion((current) => current + 1)), [i18n]);

  const locale = useLocale();

  return useMemo(() => {
    const text = (key: DataTableTextKey, params: Readonly<Record<string, unknown>> | null): string => {
      const english = EN[key] as (params: unknown, locale: string) => string;

      return i18n?.translate(NAMESPACE, key, params) ?? english(params ?? {}, locale);
    };

    return Object.fromEntries(
      KEYS.map((
        key,
      ) => [key, EN[key].length === 0 ? text(key, null) : (params: Record<string, unknown>) => text(key, params)]),
    ) as unknown as Texts;
    // `version`: a new object after a change of the language.
  }, [i18n, locale, version]);
}
