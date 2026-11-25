import type { CockpitTextKey, I18nAdapter } from '../index.js';
import { EN } from '../texts/en.js';

export type { Texts };
export { textsOf };

// The namespace of the cockpit's texts for the adapter.
const NAMESPACE = 'cockpit';

const FALLBACK_LOCALE = 'en-US';

const KEYS = Object.keys(EN) as CockpitTextKey[];

// The texts of one render: a string for a text without values, else a function of them.
type Texts = {
  readonly [K in CockpitTextKey]: Parameters<(typeof EN)[K]>[0] extends infer P
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

// The texts through the adapter: each asked with its key and its raw params; `null` (or no adapter): the English
// text, formatted in the adapter's locale (en-US without one; `i18n.md`: the page's language is never read).
function textsOf(adapter: I18nAdapter | undefined): Texts {
  const locale = validLocale(adapter?.currentLocale() ?? FALLBACK_LOCALE);
  const text = (key: CockpitTextKey, params: Readonly<Record<string, unknown>> | null): string => {
    const english = EN[key] as (params: unknown, locale: string) => string;

    return adapter?.translate(NAMESPACE, key, params) ?? english(params ?? {}, locale);
  };

  return Object.fromEntries(
    KEYS.map((
      key,
    ) => [key, EN[key].length === 0 ? text(key, null) : (params: Record<string, unknown>) => text(key, params)]),
  ) as unknown as Texts;
}
