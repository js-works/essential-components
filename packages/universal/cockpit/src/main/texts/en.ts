export { EN };

// The English (en-US) texts of the package's elements as functions of their values and the locale: the default when
// the adapter has no translation, and the master of the ICU messages in `locales/`. Only what ICU can express: values,
// `number()`, and the plural by `count === 1`. `locale` is always a valid tag (`textsOf` checks it).

const number = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);

const EN = {
  navigation: () => 'Menu',
  group: () => 'Group',
  search: () => 'Search',
  switchItem: () => 'Go to…',
  searchPlaceholder: () => 'Search by name, description or group…',
  searchNoResults: () => 'Nothing matches your search.',
  recent: () => 'Recent',
  navTreeOther: () => 'Other',
  general: () => 'General',
  sidebarCollapse: () => 'Collapse sidebar',
  sidebarResize: () => 'Resize sidebar',
  sidebarActions: () => 'Sidebar actions',
  more: () => 'More',
  account: () => 'Account',
  sidebarExpand: () => 'Expand sidebar',
  loading: () => 'Loading…',
  loadFailed: () => 'It could not be loaded.',
  retry: () => 'Try again',
  items: ({ count }: { count: number }, locale: string) => `${number(count, locale)} ${count === 1 ? 'item' : 'items'}`,
  searchHintOpen: () => 'open',
  searchHintMove: () => 'move',
  searchHintClose: () => 'close',
  closeSheet: () => 'Close',
  searchShort: () => 'Search',
  taskbarLabel: () => 'Open apps',
  taskbarClose: ({ title }: { title: string }) => `Close ${title}`,
  startPage: () => 'Start page',
  searchClear: () => 'Clear search',
  // The app header's.
  headerHome: () => 'Home',
  headerBack: () => 'Back',
  headerForward: () => 'Forward',
  headerBackTo: ({ page }: { page: string }) => `Back to ${page}`,
  headerForwardTo: ({ page }: { page: string }) => `Forward to ${page}`,
  headerModules: () => 'Modules',
  headerSwitchApp: () => 'Switch app',
  headerBreadcrumb: () => 'Breadcrumb',
  // The login's provider buttons.
  loginContinueWith: ({ provider }: { provider: string }) => `Continue with ${provider}`,
  loginOr: () => 'or',
  loginProviderFailed: () => 'The sign in failed. Please try again.',
  // The status view's presets (its kinds): their headings and messages.
  statusViewEmpty: () => 'Nothing here yet',
  statusViewEmptyMessage: () => 'Once something is added, it shows up here.',
  statusViewNoResults: () => 'No results',
  statusViewNoResultsMessage: () => 'Try other search terms or filters.',
  statusViewNotFound: () => 'Not found',
  statusViewNotFoundMessage: () => 'What you are looking for does not exist or has been moved.',
  statusViewForbidden: () => 'No access',
  statusViewForbiddenMessage: () => 'You do not have permission to view this.',
  statusViewExpired: () => 'Session expired',
  statusViewExpiredMessage: () => 'Your session has expired. Please sign in again.',
  statusViewMaintenance: () => 'Down for maintenance',
  statusViewMaintenanceMessage: () => 'We are making improvements. Please try again later.',
  statusViewError: () => 'Something went wrong',
  statusViewErrorMessage: () => 'An unexpected error occurred. Please try again.',
  // The system banner's close button.
  systemBannerDismiss: () => 'Dismiss',
};
