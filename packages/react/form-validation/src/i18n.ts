import type { FormConfig, FormValidationTextKey, I18nAdapter } from './index.js';
import { EN } from './texts/en.js';

export type { ErrorData };
export { createTranslator, humanize, isDev, LIBRARY_NAMESPACE, warnOnce };

/** Errors are stored as data and only translated when rendering. */
interface ErrorData {
  /** A key of the library's messages, or (`custom`) an explicit message of the schema or the server. */
  key: string;
  params?: Record<string, unknown>;
  /** An explicit message (schema, server): a key of the app if it can be translated, otherwise a literal text. */
  custom?: boolean;
}

// Without Node types: `process` only exists where a bundler or Node provides it.
const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const isDev = env !== undefined && env.NODE_ENV !== 'production';

const warned = new Set<string>();
function warnOnce(id: string, text: string) {
  if (!isDev || warned.has(id)) return;
  warned.add(id);
  console.warn(`[form-validation] ${text}`);
}

/** The namespace of the library's messages for the adapter. */
const LIBRARY_NAMESPACE = 'formValidation';

/** Without an adapter: English and `en-US` formatting (`i18n.md`). */
const DEFAULT_LOCALE = 'en-US';

/**
 * The texts come from the adapter. Without one, or without a translation (`null`), the library's own: its English
 * messages (formatted for the adapter's locale), the humanized field name, the literal text of a schema or the server.
 */
function createTranslator(config: FormConfig) {
  const appNamespace = config.appNamespace ?? null;

  /** A message of the library, or of the schema or the server: a key of the app if translated, else a literal text. */
  function message(err: ErrorData, adapter: I18nAdapter | undefined): string {
    const params = err.params ?? null;
    if (err.custom) return adapter?.translate(appNamespace, err.key, params) ?? err.key;
    // The keys and their values come from `issues.ts`, which only gives keys of `EN` with their values.
    const english = (EN[err.key as FormValidationTextKey] ?? EN.invalid) as (values: unknown, locale: string) => string;
    return adapter?.translate(LIBRARY_NAMESPACE, err.key, params)
      ?? english(params ?? {}, adapter?.currentLocale() ?? DEFAULT_LOCALE);
  }

  /** The label's translation, else the humanized field name, with a warning. */
  function label(key: string, path: string, adapter: I18nAdapter | undefined): string {
    const translated = adapter?.translate(appNamespace, key, null);
    if (translated != null) return translated;
    warnOnce(`label:${key}`, `No translation for the label "${key}".`);
    return humanize(path.split('.').pop() ?? path);
  }

  return { message, label };
}

/** "contractStart" -> "Contract start" */
function humanize(name: string): string {
  const words = name
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
