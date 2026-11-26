export { EN };

// The English (en-US) texts of the cockpit, the app header and the login as functions of their values and the locale: the
// default when the adapter has no translation, and the master of the ICU messages in `locales/`. Only what ICU can
// express: values, `number()`, and the plural by `count === 1`. `locale` is always a valid tag (`textsOf` checks it).

const number = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);

const EN = {
  navigation: () => 'Menu',
  group: () => 'Group',
  search: () => 'Search',
  switchItem: () => 'Go to…',
  searchPlaceholder: () => 'Search by name, description or group…',
  noResults: () => 'Nothing matches your search.',
  recent: () => 'Recent',
  other: () => 'Other',
  general: () => 'General',
  collapse: () => 'Collapse sidebar',
  resize: () => 'Resize sidebar',
  footer: () => 'Sidebar actions',
  more: () => 'More',
  account: () => 'Account',
  expand: () => 'Expand sidebar',
  loading: () => 'Loading…',
  loadFailed: () => 'It could not be loaded.',
  retry: () => 'Try again',
  items: ({ count }: { count: number }, locale: string) => `${number(count, locale)} ${count === 1 ? 'item' : 'items'}`,
  open: () => 'open',
  move: () => 'move',
  close: () => 'close',
  closeSheet: () => 'Close',
  searchShort: () => 'Search',
  taskbar: () => 'Open apps',
  closeTask: ({ title }: { title: string }) => `Close ${title}`,
  startPage: () => 'Start page',
  clearSearch: () => 'Clear search',
  // The app header's.
  home: () => 'Home',
  back: () => 'Back',
  forward: () => 'Forward',
  backTo: ({ page }: { page: string }) => `Back to ${page}`,
  forwardTo: ({ page }: { page: string }) => `Forward to ${page}`,
  modules: () => 'Modules',
  switchApp: () => 'Switch app',
  breadcrumb: () => 'Breadcrumb',
  // The login's provider buttons.
  loginContinueWith: ({ provider }: { provider: string }) => `Continue with ${provider}`,
  loginOr: () => 'or',
  loginProviderFailed: () => 'The sign in failed. Please try again.',
};
