import { constant } from '../main/core/utils.js';
import type { FileUploadTexts, I18nAdapter } from '../main/index.js';

export { createDemoI18n, createLocaleI18n };

// The demo's translations: the texts with params are functions. English is missing on purpose: the component's own
// texts are the defaults.
const GERMAN: FileUploadTexts = constant({
  dropHint: 'Dateien hierher ziehen oder',
  browse: 'Durchsuchen',
  hintAccept: ({ types }) => `Erlaubt: ${types}`,
  hintMaxFiles: ({ count }) => `Maximale Anzahl Dateien: ${count.toLocaleString('de')}`,
  hintMaxFileSize: ({ size }) => `Maximale Größe pro Datei: ${size}`,
  fileList: 'Dateien',
  statusReady: 'Bereit zum Hochladen',
  statusQueued: 'Wartet',
  statusUploading: ({ percent }) => `Wird hochgeladen: ${percent.toLocaleString('de')} %`,
  statusDone: 'Hochgeladen',
  statusError: 'Hochladen fehlgeschlagen',
  statusAborted: 'Abgebrochen',
  rejectedType: 'Dieser Dateityp ist nicht erlaubt',
  rejectedSize: ({ size }) => `Die Datei ist größer als ${size}`,
  rejectedCount: ({ count }) => `Zu viele Dateien, maximal ${count.toLocaleString('de')}`,
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
});

const TRANSLATIONS: Readonly<Record<string, FileUploadTexts>> = constant({ de: GERMAN });

// A minimal adapter: the locale is the `lang` of `<html>`, texts are looked up by language (`de-CH` uses `de`).
function createDemoI18n(): I18nAdapter {
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

// The texts in a fixed locale (the React demo creates a new adapter when its locale changes).
function createLocaleI18n(locale: string): I18nAdapter {
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
  const catalog = namespace === 'fileUpload' ? TRANSLATIONS[locale.split('-')[0] ?? ''] : undefined;
  const text: string | ((params: never) => string) | undefined = catalog?.[key as keyof FileUploadTexts];

  return typeof text === 'function' ? text(params as never) : text ?? defaultValue;
}
