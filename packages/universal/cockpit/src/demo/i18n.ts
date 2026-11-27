import type { I18nAdapter } from '../main/index.js';

export { DEMO_I18N };

// The demo's translations of the cockpit's texts (German; `{name}` a param, `_one`/`_other` the plural by `count`;
// the demo has no ICU: an app loads `locales/de.json` into its i18n).
const GERMAN: Readonly<Record<string, string>> = {
  navigation: 'Menü',
  group: 'Gruppe',
  search: 'Suchen',
  switchItem: 'Gehe zu…',
  searchPlaceholder: 'Nach Name, Beschreibung oder Gruppe suchen…',
  searchNoResults: 'Nichts passt zur Suche.',
  recent: 'Zuletzt verwendet',
  navTreeOther: 'Weitere',
  general: 'Allgemein',
  sidebarCollapse: 'Seitenleiste einklappen',
  sidebarResize: 'Breite der Seitenleiste',
  sidebarActions: 'Aktionen der Seitenleiste',
  more: 'Mehr',
  account: 'Konto',
  sidebarExpand: 'Seitenleiste ausklappen',
  loading: 'Wird geladen…',
  loadFailed: 'Es konnte nicht geladen werden.',
  retry: 'Erneut versuchen',
  items_one: '{count} Eintrag',
  items_other: '{count} Einträge',
  searchHintOpen: 'öffnen',
  searchHintMove: 'wählen',
  searchHintClose: 'schließen',
  closeSheet: 'Schließen',
  searchShort: 'Suchen',
  taskbarLabel: 'Geöffnete Apps',
  taskbarClose: '{title} schließen',
  startPage: 'Startseite',
  searchClear: 'Suche leeren',
  headerHome: 'Start',
  headerBack: 'Zurück',
  headerForward: 'Vorwärts',
  headerBackTo: 'Zurück zu {page}',
  headerForwardTo: 'Weiter zu {page}',
  headerModules: 'Module',
  headerSwitchApp: 'App wechseln',
  headerBreadcrumb: 'Navigationspfad',
  loginContinueWith: 'Weiter mit {provider}',
  loginOr: 'oder',
  loginProviderFailed: 'Die Anmeldung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
  statusViewEmpty: 'Noch nichts vorhanden',
  statusViewEmptyMessage: 'Sobald etwas hinzugefügt wird, erscheint es hier.',
  statusViewNoResults: 'Keine Treffer',
  statusViewNoResultsMessage: 'Versuchen Sie andere Suchbegriffe oder Filter.',
  statusViewNotFound: 'Nicht gefunden',
  statusViewNotFoundMessage: 'Was Sie suchen, gibt es nicht oder es wurde verschoben.',
  statusViewForbidden: 'Kein Zugriff',
  statusViewForbiddenMessage: 'Sie haben keine Berechtigung, dies anzuzeigen.',
  statusViewExpired: 'Sitzung abgelaufen',
  statusViewExpiredMessage: 'Ihre Sitzung ist abgelaufen. Bitte melden Sie sich erneut an.',
  statusViewMaintenance: 'Wartungsarbeiten',
  statusViewMaintenanceMessage: 'Wir nehmen Verbesserungen vor. Bitte versuchen Sie es später erneut.',
  statusViewError: 'Etwas ist schiefgelaufen',
  statusViewErrorMessage: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
  systemBannerDismiss: 'Ausblenden',
  appearancePickerScheme: 'Farbschema',
  appearancePickerLight: 'Hell',
  appearancePickerSystem: 'System',
  appearancePickerDark: 'Dunkel',
  appearancePickerAccent: 'Akzentfarbe',
  themeMenu: 'Darstellung',
  themeMenuScheme: 'Farbschema',
  themeMenuLight: 'Hell',
  themeMenuSystem: 'System',
  themeMenuDark: 'Dunkel',
  themeMenuAccent: 'Akzentfarbe',
  themeMenuDensity: 'Dichte',
  themeMenuCompact: 'Kompakt',
  themeMenuNormal: 'Normal',
  themeMenuComfortable: 'Komfortabel',
};

// The demo's adapter: the page's language (`<html lang>`, set by the footer's language switch), German for `de…`,
// else the cockpit's English.
const isGerman = () => document.documentElement.lang.toLowerCase().startsWith('de');

const ADAPTER: I18nAdapter = {
  currentLocale: () => document.documentElement.lang || 'en-US',
  // `null` without a translation: then the cockpit uses its English text.
  translate: (_, key, params) => {
    if (!isGerman()) {
      return null;
    }

    const plural = typeof params?.['count'] === 'number' ? (params['count'] === 1 ? '_one' : '_other') : '';
    const text = GERMAN[`${key}${plural}`];

    return text === undefined
      ? null
      : text.replace(/\{(\w+)\}/g, (_match, name: string) => String(params?.[name] ?? ''));
  },
  onChange: (listener) => {
    const observer = new MutationObserver(listener);

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    return () => observer.disconnect();
  },
};

// The cockpit's and the app header's `i18n` on the demo pages.
const DEMO_I18N = ADAPTER;
