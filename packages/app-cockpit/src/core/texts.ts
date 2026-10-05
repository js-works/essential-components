export { textsFor };
export type { Texts };

// The cockpit's own texts, in the language of the page (`<html lang>`): German for `de…`, else English.
type Texts = {
  navigation: string;
  group: string;
  search: string;
  switchApp: string;
  searchPlaceholder: string;
  noResults: string;
  recent: string;
  other: string;
  collapse: string;
  resize: string;
  footer: string;
  more: string;
  account: string;
  expand: string;
  loading: string;
  loadFailed: string;
  retry: string;
  apps: (count: number) => string;
  open: string;
  move: string;
  close: string;
  closeSheet: string;
  searchShort: string;
};

const EN: Texts = {
  navigation: 'Apps',
  group: 'Group',
  search: 'Search apps',
  switchApp: 'Switch app',
  searchPlaceholder: 'Search apps by name, description or group…',
  noResults: 'No app matches your search.',
  recent: 'Recent',
  other: 'Other',
  collapse: 'Collapse sidebar',
  resize: 'Resize sidebar',
  footer: 'Sidebar actions',
  more: 'More',
  account: 'Account',
  expand: 'Expand sidebar',
  loading: 'Loading…',
  loadFailed: 'The app could not be loaded.',
  retry: 'Try again',
  apps: (count) => (count === 1 ? '1 app' : `${count} apps`),
  open: 'open',
  move: 'move',
  close: 'close',
  closeSheet: 'Close',
  searchShort: 'Search',
};

const DE: Texts = {
  navigation: 'Apps',
  group: 'Gruppe',
  search: 'Apps suchen',
  switchApp: 'App wechseln',
  searchPlaceholder: 'Apps nach Name, Beschreibung oder Gruppe suchen…',
  noResults: 'Keine App passt zur Suche.',
  recent: 'Zuletzt verwendet',
  other: 'Weitere',
  collapse: 'Seitenleiste einklappen',
  resize: 'Breite der Seitenleiste',
  footer: 'Aktionen der Seitenleiste',
  more: 'Mehr',
  account: 'Konto',
  expand: 'Seitenleiste ausklappen',
  loading: 'Wird geladen…',
  loadFailed: 'Die App konnte nicht geladen werden.',
  retry: 'Erneut versuchen',
  apps: (count) => (count === 1 ? '1 App' : `${count} Apps`),
  open: 'öffnen',
  move: 'wählen',
  close: 'schließen',
  closeSheet: 'Schließen',
  searchShort: 'Suchen',
};

function textsFor(lang: string): Texts {
  return lang.toLowerCase().startsWith('de') ? DE : EN;
}
