import type { SavedTableFilter } from '../../domain/index.js';
import { createSavedFilterRepository } from './saved-filter-repository.js';

export { createInMemorySavedFilters };

type Filters = Readonly<Record<string, unknown>>;

// The colleagues' shared filters (made up, to show sharing), first in each table's list.
const COLLEAGUES_FILTERS: Readonly<Record<string, readonly SavedTableFilter[]>> = {
  employees: [
    sharedBy('Julia Wagner', 'Absent today', { todayKey: ['vacation', 'special', 'unpaid', 'sick', 'holiday'] }),
    sharedBy('Felix Braun', 'Engineering', { team: ['Engineering'] }),
  ],
  'team-leave': [
    sharedBy('Julia Wagner', 'Pending requests', { status: ['pending'] }),
    sharedBy('Felix Braun', 'Vacation', { type: ['vacation'] }),
  ],
};

// The saved filters of the tables: the colleagues' and the user's own (per browser).
function createInMemorySavedFilters() {
  return createSavedFilterRepository('time-tracker:saved-filters', COLLEAGUES_FILTERS);
}

// A made-up colleague's shared filter.
function sharedBy(owner: string, name: string, filters: Filters): SavedTableFilter {
  return { id: `shared:${owner}:${name}`, name, filters, shared: true, owner };
}
