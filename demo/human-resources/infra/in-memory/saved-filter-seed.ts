import type { SavedTableFilter } from '../../domain/index.js';
import { createSavedFilterRepository } from './saved-filter-repository.js';

export { createInMemorySavedFilters };

type Filters = Readonly<Record<string, unknown>>;

// The colleagues' shared filters (made up, to show sharing), first in each table's list.
const COLLEAGUES_FILTERS: Readonly<Record<string, readonly SavedTableFilter[]>> = {
  checklists: [
    sharedBy('Sophie Brandt', 'Open onboardings', { kind: ['onboarding'], state: ['open'] }),
    sharedBy('Tom Becker', 'Offboardings', { kind: ['offboarding'] }),
  ],
  openings: [
    sharedBy('Tom Becker', 'Open positions', { status: ['open'] }),
    sharedBy('Sophie Brandt', 'Sales openings', { department: ['Sales', 'Sales DACH', 'International Sales'] }),
  ],
  employees: [
    sharedBy('Sophie Brandt', 'Engineering, full time', { department: ['Engineering'], employmentType: ['fullTime'] }),
    sharedBy('Tom Becker', 'Starting soon', { status: ['upcoming'] }),
    sharedBy('Sophie Brandt', 'Berlin office', { location: ['Berlin'] }),
  ],
};

// The saved filters of the tables: the colleagues' and the user's own (per browser).
function createInMemorySavedFilters() {
  return createSavedFilterRepository('human-resources:saved-filters', COLLEAGUES_FILTERS);
}

// A made-up colleague's shared filter.
function sharedBy(owner: string, name: string, filters: Filters): SavedTableFilter {
  return { id: `shared:${owner}:${name}`, name, filters, shared: true, owner };
}
