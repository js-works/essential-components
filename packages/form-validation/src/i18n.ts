import { catalogs, localeCandidates } from './messages';
import type { FormConfig, FormI18n, Message, MessageContext, PropNames } from './types';

export { createTranslator, documentLocale, humanize, isDev, warnOnce };
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

/** The default: the locale of <html lang>, otherwise the browser language. */
const documentLocale: FormI18n = {
  useLocale: () =>
    (typeof document !== 'undefined' && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language)
    || 'en',
};

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

function createTranslator<P extends PropNames>(config: FormConfig<P>, i18n: FormI18n) {
  const fallback = config.fallbackLocale ?? 'en';

  /** The app adapter, then the app messages, then the library catalog (exact, base language, fallback). */
  function lookup(key: string, params: Record<string, unknown>, locale: string): string | undefined {
    const fromAdapter = i18n.translate?.(key, params, locale);
    if (fromAdapter != null) return fromAdapter;
    const candidates = [...localeCandidates(locale), ...localeCandidates(fallback)];
    for (const loc of candidates) {
      const msg = config.messages?.[loc]?.[key] ?? catalogs[loc]?.[key];
      if (msg != null) return render(msg, params, loc);
    }
    return undefined;
  }

  function message(err: ErrorData, locale: string): string {
    const text = lookup(err.key, err.params ?? {}, locale);
    if (text != null) return text;
    if (err.custom) return err.key; // a literal message
    warnOnce(`msg:${err.key}`, `No translation for the message "${err.key}".`);
    return err.key;
  }

  function label(key: string, path: string, locale: string): string {
    const text = lookup(key, {}, locale);
    if (text != null) return text;
    warnOnce(`label:${key}:${locale}`, `No translation for the label "${key}" (${locale}).`);
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
