import type { FileUploadTextKey, I18nAdapter } from '../index.js';
import { EN } from '../texts/en.js';
import { constant } from './utils.js';

export type { Localizer, TextKey };
export { createLocalizer };

type TextKey = FileUploadTextKey;

// The params of a text (`null` for a text without params).
type TextArgs<K extends TextKey> = Parameters<(typeof EN)[K]>[0] extends infer P ? undefined extends P ? null : P
  : never;

// The namespace of our texts in an `I18nAdapter`.
const NAMESPACE = 'fileUpload';

const FALLBACK_LOCALE = 'en-US';

const SIZE_UNITS = constant(['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte']);

// Texts and formatting for one render, in the locale that the adapter reports right now.
type Localizer = {
  readonly text: <K extends TextKey>(key: K, params: TextArgs<K>) => string;
  readonly formatSize: (bytes: number) => string;
};

// Without an adapter, or without a translation (`null`): the English texts, formatted in the adapter's locale (en-US
// without one).
function createLocalizer(i18n: I18nAdapter | undefined): Localizer {
  const locale = validLocale(i18n?.currentLocale() ?? FALLBACK_LOCALE);

  return {
    text: (key, params) => {
      const english = EN[key] as (params: unknown, locale: string) => string;

      return i18n?.translate(NAMESPACE, key, params) ?? english(params ?? {}, locale);
    },
    formatSize: (bytes) => formatSize(bytes, locale),
  };
}

// An invalid tag falls back to en-US instead of throwing.
function validLocale(locale: string): string {
  try {
    new Intl.NumberFormat(locale);

    return locale;
  } catch {
    return FALLBACK_LOCALE;
  }
}

// Formats a size in bytes with the unit that fits (1 kB = 1024 bytes).
function formatSize(bytes: number, locale: string): string {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }

  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: SIZE_UNITS[unit] ?? 'byte',
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
}
