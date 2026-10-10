import type { FileUpload } from '../src';

export { createDemoI18n, createLocaleI18n };

// The demo's translations. English is missing on purpose: the component's own texts are the defaults.
const GERMAN: Readonly<Partial<Record<FileUpload.TextKey, string>>> = {
  dropHint: 'Dateien hierher ziehen oder',
  browse: 'Durchsuchen',
  hintAccept: 'Erlaubt: {types}',
  hintMaxFiles: 'Maximale Anzahl Dateien: {count}',
  hintMaxFileSize: 'Maximale Größe pro Datei: {size}',
  fileList: 'Dateien',
  statusReady: 'Bereit zum Hochladen',
  statusQueued: 'Wartet',
  statusUploading: 'Wird hochgeladen: {percent} %',
  statusDone: 'Hochgeladen',
  statusError: 'Hochladen fehlgeschlagen',
  statusAborted: 'Abgebrochen',
  rejectedType: 'Dieser Dateityp ist nicht erlaubt',
  rejectedSize: 'Die Datei ist größer als {size}',
  rejectedCount: 'Zu viele Dateien, maximal {count}',
  upload: 'Hochladen',
  uploadAll: 'Alle hochladen',
  clear: 'Leeren',
  cancel: 'Abbrechen',
  stop: 'Stoppen',
  retry: 'Erneut versuchen',
  remove: 'Entfernen',
  showPreview: 'Vorschau anzeigen',
  closePreview: 'Vorschau schließen',
  validationFailed: 'Die fehlgeschlagenen Dateien erneut hochladen oder entfernen.',
  validationPending: 'Warten, bis alle Dateien hochgeladen sind.',
  validationRequired: 'Bitte eine Datei hinzufügen.',
};

const TRANSLATIONS: Readonly<Record<string, Readonly<Record<string, string | undefined>>>> = { de: GERMAN };

// A minimal adapter: the locale is the `lang` of `<html>`, texts are looked up by language (`de-CH` uses `de`), and
// `{name}` placeholders are filled in, numbers formatted for the locale.
function createDemoI18n(): FileUpload.I18nAdapter {
  const root = document.documentElement;
  const currentLocale = () => root.lang || 'en-US';

  return {
    currentLocale,
    resolveText: (namespace, key, params, defaultValue) =>
      resolveText(currentLocale(), namespace, key, params, defaultValue),

    // Every change of `<html lang>` is a language change.
    onChange: (listener) => {
      const observer = new MutationObserver(listener);

      observer.observe(root, { attributes: true, attributeFilter: ['lang'] });

      return () => observer.disconnect();
    },
  };
}

// The same texts, in a fixed locale (the React demo creates a new adapter when its locale changes).
function createLocaleI18n(locale: string): FileUpload.I18nAdapter {
  return {
    currentLocale: () => locale,
    resolveText: (namespace, key, params, defaultValue) => resolveText(locale, namespace, key, params, defaultValue),
  };
}

function resolveText(
  locale: string,
  namespace: string,
  key: string,
  params: Readonly<Record<string, unknown>> | null,
  defaultValue: string,
): string {
  const text = namespace === 'fileUpload' ? TRANSLATIONS[locale.split('-')[0] ?? '']?.[key] : undefined;

  if (text === undefined) {
    return defaultValue;
  }

  return text.replace(/\{(\w+)\}/g, (_, name: string) => {
    const value = params?.[name];

    return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : String(value);
  });
}
