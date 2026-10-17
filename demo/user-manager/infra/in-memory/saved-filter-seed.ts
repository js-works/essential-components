import type { SavedTableFilter } from '../../domain/index.js';
import { createSavedFilterRepository } from './saved-filter-repository.js';

export { createInMemorySavedFilters };

type Filters = Readonly<Record<string, unknown>>;

// The colleagues' shared filters (made up, to show sharing), first in each table's list.
const COLLEAGUES_FILTERS: Readonly<Record<string, readonly SavedTableFilter[]>> = {
  users: [
    sharedBy('Laura Schmidt', 'Disabled users', { status: ['Disabled'] }),
    sharedBy('Max Müller', 'IT and Finance', { department: ['IT', 'Finance'] }),
  ],
  access: [
    sharedBy('Laura Schmidt', 'Group grants', { type: ['Group'] }),
    sharedBy('Max Müller', 'Owners', { role: ['Owner'] }),
    sharedBy('Laura Schmidt', 'Granted this month', { created: { from: daysFromToday(-30), to: daysFromToday(0) } }),
  ],
};

// The saved filters of the tables: the colleagues' and the user's own (per browser).
function createInMemorySavedFilters() {
  return createSavedFilterRepository('user-manager:saved-filters', COLLEAGUES_FILTERS);
}

// A made-up colleague's shared filter.
function sharedBy(owner: string, name: string, filters: Filters): SavedTableFilter {
  return { id: `shared:${owner}:${name}`, name, filters, shared: true, owner };
}

// The day `days` from today (before it when negative), `yyyy-mm-dd` in local time.
function daysFromToday(days: number): string {
  const date = new Date();

  date.setDate(date.getDate() + days);

  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, '0'))
    .join('-');
}
