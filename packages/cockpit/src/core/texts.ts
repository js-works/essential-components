export { textsFor };
export type { Texts };

// The cockpit's own texts, in the language of the page (`<html lang>`): German for `de…`, else English.
type Texts = {
  navigation: string;
  group: string;
  search: string;
  switchItem: string;
  searchPlaceholder: string;
  noResults: string;
  recent: string;
  other: string;
  general: string;
  collapse: string;
  resize: string;
  footer: string;
  more: string;
  account: string;
  expand: string;
  loading: string;
  loadFailed: string;
  retry: string;
  items: (count: number) => string;
  open: string;
  move: string;
  close: string;
  closeSheet: string;
  searchShort: string;
  taskbar: string;
  closeTask: (title: string) => string;
  startPage: string;
  clearSearch: string;
};

const EN: Texts = {
  navigation: 'Menu',
  group: 'Group',
  search: 'Search',
  switchItem: 'Go to…',
  searchPlaceholder: 'Search by name, description or group…',
  noResults: 'Nothing matches your search.',
  recent: 'Recent',
  other: 'Other',
  general: 'General',
  collapse: 'Collapse sidebar',
  resize: 'Resize sidebar',
  footer: 'Sidebar actions',
  more: 'More',
  account: 'Account',
  expand: 'Expand sidebar',
  loading: 'Loading…',
  loadFailed: 'It could not be loaded.',
  retry: 'Try again',
  items: (count) => (count === 1 ? '1 item' : `${count} items`),
  open: 'open',
  move: 'move',
  close: 'close',
  closeSheet: 'Close',
  searchShort: 'Search',
  taskbar: 'Open apps',
  closeTask: (title) => `Close ${title}`,
  startPage: 'Start page',
  clearSearch: 'Clear search',
};

const DE: Texts = {
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
  items: (count) => (count === 1 ? '1 Eintrag' : `${count} Einträge`),
  open: 'öffnen',
  move: 'wählen',
  close: 'schließen',
  closeSheet: 'Schließen',
  searchShort: 'Suchen',
  taskbar: 'Geöffnete Apps',
  closeTask: (title) => `${title} schließen`,
  startPage: 'Startseite',
  clearSearch: 'Suche leeren',
};

function textsFor(lang: string): Texts {
  return lang.toLowerCase().startsWith('de') ? DE : EN;
}
