export type { CockpitTexts };

// The cockpit's texts (and the app header's), the namespace `'cockpit'` of the `I18nAdapter`: each with its English
// text, `{name}` a param.
type CockpitTexts = {
  navigation: string; // Menu
  group: string; // Group
  search: string; // Search
  switchItem: string; // Go to…
  searchPlaceholder: string; // Search by name, description or group…
  noResults: string; // Nothing matches your search.
  recent: string; // Recent
  other: string; // Other
  general: string; // General
  collapse: string; // Collapse sidebar
  resize: string; // Resize sidebar
  footer: string; // Sidebar actions
  more: string; // More
  account: string; // Account
  expand: string; // Expand sidebar
  loading: string; // Loading…
  loadFailed: string; // It could not be loaded.
  retry: string; // Try again
  items: (params: { count: number }) => string; // {count} item / {count} items
  open: string; // open
  move: string; // move
  close: string; // close
  closeSheet: string; // Close
  searchShort: string; // Search
  taskbar: string; // Open apps
  closeTask: (params: { title: string }) => string; // Close {title}
  startPage: string; // Start page
  clearSearch: string; // Clear search
  // The app header's.
  home: string; // Home
  back: string; // Back
  forward: string; // Forward
  backTo: (params: { page: string }) => string; // Back to {page}
  forwardTo: (params: { page: string }) => string; // Forward to {page}
  modules: string; // Modules
  switchApp: string; // Switch app
  breadcrumb: string; // Breadcrumb
};
