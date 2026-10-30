import type { I18nAdapter } from '../main/index.js';

export { DEMO_I18N };

// The demo's translations of the cockpit's texts (German; `{name}` a param, `_one`/`_other` the plural by `count`).
const GERMAN: Readonly<Record<string, string>> = {
  navigation: 'Menü',
  group: 'Gruppe',
  search: 'Suchen',
  switchItem: 'Gehe zu…',
  searchPlaceholder: 'Nach Name, Beschreibung oder Gruppe suchen…',
  noResults: 'Nichts passt zur Suche.',
  recent: 'Zuletzt verwendet',
  other: 'Weitere',
  general: 'Allgemein',
  collapse: 'Seitenleiste einklappen',
  resize: 'Breite der Seitenleiste',
  footer: 'Aktionen der Seitenleiste',
  more: 'Mehr',
  account: 'Konto',
  expand: 'Seitenleiste ausklappen',
  loading: 'Wird geladen…',
  loadFailed: 'Es konnte nicht geladen werden.',
  retry: 'Erneut versuchen',
  items_one: '{count} Eintrag',
  items_other: '{count} Einträge',
  open: 'öffnen',
  move: 'wählen',
  close: 'schließen',
  closeSheet: 'Schließen',
  searchShort: 'Suchen',
  taskbar: 'Geöffnete Apps',
  closeTask: '{title} schließen',
  startPage: 'Startseite',
  clearSearch: 'Suche leeren',
  home: 'Start',
  back: 'Zurück',
  forward: 'Vorwärts',
  backTo: 'Zurück zu {page}',
  forwardTo: 'Weiter zu {page}',
  modules: 'Module',
  switchApp: 'App wechseln',
  breadcrumb: 'Navigationspfad',
};

// The demo's adapter: the page's language (`<html lang>`, set by the footer's language switch), German for `de…`,
// else the cockpit's English.
const isGerman = () => document.documentElement.lang.toLowerCase().startsWith('de');

const ADAPTER: I18nAdapter = {
  currentLocale: () => document.documentElement.lang || 'en-US',
  resolveText: (_, key, params, defaultValue) => {
    if (!isGerman()) {
      return defaultValue;
    }

    const plural = typeof params?.['count'] === 'number' ? (params['count'] === 1 ? '_one' : '_other') : '';
    const text = GERMAN[`${key}${plural}`];

    return text === undefined
      ? defaultValue
      : text.replace(/\{(\w+)\}/g, (_match, name: string) => String(params?.[name] ?? ''));
  },
  onChange: (listener) => {
    const observer = new MutationObserver(listener);

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    return () => observer.disconnect();
  },
};

// The cockpit's and the app header's `i18n` on the demo pages.
const DEMO_I18N = { type: 'factory', getAdapter: () => ADAPTER } as const;
