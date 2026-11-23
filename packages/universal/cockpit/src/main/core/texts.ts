import type { CockpitTexts, I18nAdapter } from '../index.js';

export { textsOf };

// The namespace of the cockpit's texts for the adapter.
const NAMESPACE = 'cockpit';

// The English texts: the default without an adapter (`i18n.md`: English and en-US, the page's language is never read),
// and the `defaultValue` for the adapter.
const EN: CockpitTexts = {
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
  items: ({ count }) => (count === 1 ? '1 item' : `${count} items`),
  open: 'open',
  move: 'move',
  close: 'close',
  closeSheet: 'Close',
  searchShort: 'Search',
  taskbar: 'Open apps',
  closeTask: ({ title }) => `Close ${title}`,
  startPage: 'Start page',
  clearSearch: 'Clear search',
  // The app header's.
  home: 'Home',
  back: 'Back',
  forward: 'Forward',
  backTo: ({ page }) => `Back to ${page}`,
  forwardTo: ({ page }) => `Forward to ${page}`,
  modules: 'Modules',
  switchApp: 'Switch app',
  breadcrumb: 'Breadcrumb',
};

// The texts through the adapter: each asked with its key, its params and the English text, filled in.
function textsOf(adapter: I18nAdapter | undefined): CockpitTexts {
  if (adapter === undefined) {
    return EN;
  }

  const entries = Object.entries(EN).map(([key, text]: [string, CockpitTexts[keyof CockpitTexts]]) => [
    key,
    typeof text === 'string'
      ? adapter.resolveText(NAMESPACE, key, null, text)
      : (params: Readonly<Record<string, unknown>>) =>
        adapter.resolveText(NAMESPACE, key, params, (text as (params: never) => string)(params as never)),
  ]);

  return Object.fromEntries(entries) as CockpitTexts;
}
