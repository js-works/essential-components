import type { TableFilter } from '@local/data-table/react';
import { autocompleteFilter, selectFilter } from '@local/data-table/react';

import type { Organization, SuggestOrganizations } from '../../domain/index.js';
import { countryName } from '../../shared/lib/countries.js';
import { suggestion } from '../../shared/ui/suggestion.js';

export { countryFilter, organizationFilter };

// The filter of every column of an organization (by name, the value is the name): an autocomplete of `suggest`'s
// organizations, all options when the list opens, each with the organization's city as its second line.
function organizationFilter(suggest: SuggestOrganizations): TableFilter {
  return autocompleteFilter({
    multiple: true,
    minQueryLength: 0,
    load: async (query, signal) =>
      (await suggest(query, signal)).map((option) => ({
        value: option.name,
        label: option.name,
        content: suggestion(option.name, option.city),
      })),
  });
}

// The filter of the country (its ISO code, shown by its name): the countries the given organizations have, by name.
function countryFilter(organizations: readonly Organization[]): TableFilter {
  const codes = new Set(organizations.map((organization) => organization.country).filter((code) => code !== ''));

  return selectFilter({
    options: [...codes]
      .map((code) => ({ value: code, label: countryName(code) }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    multiple: true,
  });
}
