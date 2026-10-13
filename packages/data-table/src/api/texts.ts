export type { Texts };

type Texts = {
  selectedCount: (params: { count: number }) => string; // {count} selected
  itemRange: (params: { from: number; to: number; total: number }) => string; // {from}-{to} of {total}
  itemSingle: (params: { item: number; total: number }) => string; // {item} of {total}
  pageSize: string; // Page Size
  perPage: (params: { count: number }) => string; // {count} per page
  pageOf: (params: { page: number; pages: number }) => string; // {page} of {pages}
  goToPage: (params: { page: number }) => string; // Page {page}
  previousPage: string; // Previous page
  nextPage: string; // Next page
  empty: string; // No entries
  emptySearch: string; // No results found
  searchPlaceholder: string; // Search
  clearFilter: string; // Clear filter
  filterAll: string; // All
  filterPlaceholder: string; // Filter
  clearSearch: string; // Clear search
  reload: string; // Reload
  loading: string; // Loading…
  selectAll: string; // Select all rows
  deselectAll: string; // Deselect all rows
  selectRow: string; // Select row
  deselectRow: string; // Deselect row
  expandAllDetails: string; // Show all details
  collapseAllDetails: string; // Hide all details
  expandDetails: string; // Show details
  collapseDetails: string; // Hide details
  sortAsc: string; // Sort ascending
  sortDesc: string; // Sort descending
  calendarPrevious: string; // Previous
  calendarNext: string; // Next
  clear: string; // Clear
  filters: string; // Filters
  activeFilters: (params: { count: number }) => string; // {count} active
  resetFilters: string; // Reset
  applyFilters: string; // Apply
  cancelFilters: string; // Cancel
  clearAllFilters: string; // Clear all
  removeFilter: string; // Remove filter
  emptyFilters: string; // No rows match these filters
  clearFilters: string; // Clear filters
  textMatch: string; // Match
  textContains: string; // contains
  textStartsWith: string; // starts with
  textEndsWith: string; // ends with
  rangeFrom: string; // From
  rangeTo: string; // To
  filterYes: string; // Yes
  filterNo: string; // No
  typeToSearch: string; // Type to search
  loadFailed: string; // Could not load
  removeValue: (params: { label: string }) => string; // Remove {label}
  clearSelection: string; // Clear selection
  columns: string; // Columns
  resetColumnWidths: string; // Reset column widths
  optimizeColumnWidths: string; // Optimize column widths
  layout: string; // Layout
  layoutAuto: string; // Automatic
  layoutTable: string; // Table
  layoutCards: string; // Cards
  moveRow: string; // Move row
  emptyGroup: string; // (Blank)
  movedTo: (params: { position: number }) => string; // Moved to position {position}
  expandGroup: string; // Show group
  collapseGroup: string; // Hide group
  selectGroup: string; // Select group
  deselectGroup: string; // Deselect group
  groupCount: (params: { count: number }) => string; // {count}
  groupPartial: (params: { shown: number; total: number }) => string; // {shown} of {total}
  totalCount: (params: { count: number }) => string; // {count}
  confirmEdit: string; // OK
  confirmNew: string; // Add
  cancelEdit: string; // Cancel
  saveFailed: string; // The row could not be saved
  editRow: string; // Edit row
  newRow: string; // New row
  savedFilters: string; // Saved filters
  saveFilter: string; // Save as…
  filterName: string; // Name
  confirmSaveFilter: string; // Save
  cancelSaveFilter: string; // Cancel
  saveFilterFailed: string; // The filter could not be saved
  deleteSavedFilter: (params: { name: string }) => string; // Delete {name}
  shareFilter: string; // Share
  sharedFilter: string; // Shared
  privateFilter: string; // Private
  filterOwner: (params: { name: string }) => string; // by {name}
  shareSavedFilter: (params: { name: string }) => string; // Share {name}
};
