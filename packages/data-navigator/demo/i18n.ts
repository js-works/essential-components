import type { DataNavigatorComponent } from '../src/react';

export { i18n };

// The demo's translations. English is missing on purpose: the component's own texts are the defaults.
const GERMAN: Readonly<Record<keyof DataNavigatorComponent.Texts, string>> = {
  selectedCount: '{count} ausgewählt',
  itemRange: 'Einträge {from}-{to} / {total}',
  pageSize: 'Seitengröße',
  page: 'Seite',
  pageOf: 'von {pages}',
  firstPage: 'Erste Seite',
  previousPage: 'Vorherige Seite',
  nextPage: 'Nächste Seite',
  lastPage: 'Letzte Seite',
  empty: 'Keine Daten',
  emptySearch: 'Keine Ergebnisse gefunden',
  searchPlaceholder: 'Suchen',
  clearFilter: 'Filter löschen',
  filterAll: 'Alle',
  filterPlaceholder: 'Filtern',
  clearSearch: 'Suche löschen',
  loading: 'Lädt',
  selectAll: 'Alle Zeilen auswählen',
  deselectAll: 'Auswahl aller Zeilen aufheben',
  selectRow: 'Zeile auswählen',
  deselectRow: 'Zeilenauswahl aufheben',
  expandAllDetails: 'Alle Details anzeigen',
  collapseAllDetails: 'Alle Details ausblenden',
  expandDetails: 'Details anzeigen',
  collapseDetails: 'Details ausblenden',
  sortAsc: 'Aufsteigend sortieren',
  sortDesc: 'Absteigend sortieren',
  calendarPrevious: 'Zurück',
  calendarNext: 'Weiter',
  clear: 'Löschen',
};

const TRANSLATIONS: Readonly<Record<string, Readonly<Record<string, string | undefined>>>> = { de: GERMAN };

const root = document.documentElement;

const currentLocale = () => root.lang || 'en-US';

// A minimal I18nAdapter, without any i18n library (the same shape as the one of the file-upload component, so one
// object could serve both): the locale is the `lang` of `<html>`, texts are looked up by language (`de-AT` uses `de`),
// and `{name}` placeholders are filled in, numbers formatted for the locale.
const i18n: DataNavigatorComponent.I18nAdapter = {
  currentLocale,

  resolveText: (namespace, key, params, defaultValue) => {
    const locale = currentLocale();
    const text = namespace === 'datanav' ? TRANSLATIONS[locale.split('-')[0] ?? '']?.[key] : undefined;

    if (text === undefined) {
      return defaultValue;
    }

    return text.replace(/\{(\w+)\}/g, (_, name: string) => {
      const value = params?.[name];

      return typeof value === 'number' ? new Intl.NumberFormat(locale).format(value) : String(value);
    });
  },

  // Every change of `<html lang>` is a change of the language.
  onChange: (listener) => {
    const observer = new MutationObserver(listener);

    observer.observe(root, { attributes: true, attributeFilter: ['lang'] });

    return () => observer.disconnect();
  },
};
