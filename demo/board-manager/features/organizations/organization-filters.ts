import { autocompleteFilter, selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import type { Organization } from '../../domain/index.js';
import { suggestOrganizations } from '../../infra/in-memory/index.js';
import { countryName } from '../../shared/lib/countries.js';
import { suggestion } from '../../shared/ui/suggestion.js';

export { countryFilter, organizationFilter };

// The filter of every column of an organization (by name, the value is the name): an autocomplete, all options when
// the list opens (`minQueryLength: 0`), each with the organization's city as its second line.
const organizationFilter = autocompleteFilter({
  multiple: true,
  minQueryLength: 0,
  load: async (query, signal) =>
    (await suggestOrganizations(query, signal)).map(({ city, ...option }) => ({
      ...option,
      content: suggestion(option.label, city),
    })),
});

// The filter of the country of an organization (by its name): the countries the given organizations have, sorted.
function countryFilter(organizations: readonly Organization[]): TableFilter {
  const names = new Set(organizations.map((organization) => countryName(organization.country)));

  return selectFilter({ options: [...names].filter((name) => name !== '').sort(), multiple: true });
}
