import { catalogs, localeCandidates } from './messages';
import type { FormConfig, I18nAdapter, Message, MessageContext, PropNames } from './types';

export { checkI18nType, createTranslator, documentLocale, humanize, isDev, LIBRARY_NAMESPACE, warnOnce };
export type { ErrorData };

/** Errors are stored as data and only translated when rendering. */
interface ErrorData {
  key: string;
  params?: Record<string, unknown>;
  /** An explicit message (schema, server): a key if it can be translated, otherwise a literal text. */
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
const LIBRARY_NAMESPACE = 'formvalidation';

/** Without an adapter: the locale of <html lang>, otherwise the browser language. */
function documentLocale(): string {
  return (typeof document !== 'undefined' && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language)
    || 'en';
}

/** The union type prevents any other `type`, but not in plain JavaScript or with a cast config (e.g. the old form). */
function checkI18nType(i18n: { type: unknown } | undefined) {
  if (i18n !== undefined && i18n.type !== 'factory' && i18n.type !== 'hook') {
    throw new TypeError(`Unknown i18n type: ${String(i18n.type)} (expected 'factory' or 'hook').`);
  }
}

function formatParams(params: Record<string, unknown>, locale: string): Record<string, string> {
  const num = new Intl.NumberFormat(locale);
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'medium' });
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(params)) {
    if (typeof v === 'number' || typeof v === 'bigint') out[k] = num.format(v);
    else if (v instanceof Date) out[k] = date.format(v);
    else out[k] = String(v);
  }
  return out;
}

function render(msg: Message, params: Record<string, unknown>, locale: string): string {
  if (typeof msg === 'string') return msg;
  const formatted = formatParams(params, locale);
  const rules = new Intl.PluralRules(locale);
  const ctx: MessageContext = {
    locale,
    count(param, forms) {
      const n = Number(params[param]);
      const form = forms[rules.select(n)] ?? forms.other ?? '#';
      return form.replace('#', formatted[param] ?? String(n));
    },
  };
  return msg(formatted, ctx);
}

function createTranslator<P extends PropNames>(config: FormConfig<P>) {
  const fallback = config.fallbackLocale ?? 'en';
  const appNamespace = config.appNamespace ?? 'app';

  /** The app messages, then the library catalog (exact, base language, fallback). The adapter comes after it. */
  function lookup(key: string, params: Record<string, unknown>, locale: string): string | undefined {
    const candidates = [...localeCandidates(locale), ...localeCandidates(fallback)];
    for (const loc of candidates) {
      const msg = config.messages?.[loc]?.[key] ?? catalogs[loc]?.[key];
      if (msg != null) return render(msg, params, loc);
    }
    return undefined;
  }

  /**
   * The text of the library (or the app messages) goes to the adapter as `defaultValue`, so the adapter has the last
   * word. A message of the schema or the server is an app key, or a literal text if nothing translates it. `quiet`: no
   * warning (the adapter of a factory is not there yet).
   */
  function message(err: ErrorData, locale: string, adapter: I18nAdapter | undefined, quiet = false): string {
    const text = lookup(err.key, err.params ?? {}, locale);
    const defaultValue = text ?? err.key;
    const namespace = err.custom ? appNamespace : LIBRARY_NAMESPACE;
    const result = adapter?.resolveText(namespace, err.key, err.params ?? null, defaultValue) ?? defaultValue;
    if (!quiet && text == null && !err.custom && result === defaultValue) {
      warnOnce(`msg:${err.key}`, `No translation for the message "${err.key}".`);
    }
    return result;
  }

  /**
   * Without a translation (the adapter returns the `defaultValue`), the humanized field name. The warning only without
   * an adapter: a translation may equal the humanized name ("Name"), and an i18n library reports missing keys itself.
   */
  function label(key: string, path: string, locale: string, adapter: I18nAdapter | undefined, quiet = false): string {
    const text = lookup(key, {}, locale);
    const defaultValue = text ?? humanize(path.split('.').pop() ?? path);
    const result = adapter?.resolveText(appNamespace, key, null, defaultValue) ?? defaultValue;
    if (!quiet && !adapter && text == null) {
      warnOnce(`label:${key}:${locale}`, `No translation for the label "${key}" (${locale}).`);
    }
    return result;
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
