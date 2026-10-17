import type { TableFilter } from '@local/data-table/react';
import { autocompleteFilter, selectFilter } from '@local/data-table/react';

import type { SuggestPeople } from '../../domain/index.js';
import { ROLES } from '../../domain/index.js';
import type { Translate } from '../../shared/lib/i18n/index.js';
import { suggestion } from '../../shared/ui/suggestion.js';

export { personFilter, roleFilter };

// The filter of every column of a person (by name, the value is the name): an autocomplete of `suggest`'s people, all
// options when the list opens (`minQueryLength: 0`), each with the person's organization as its second line.
function personFilter(suggest: SuggestPeople): TableFilter {
  return autocompleteFilter({
    multiple: true,
    minQueryLength: 0,
    load: async (query, signal) =>
      (await suggest(query, undefined, signal)).map((option) => ({
        value: option.name,
        label: option.name,
        content: suggestion(option.name, option.organization),
      })),
  });
}

// The filter of a role on a board (chair, vice chair, secretary, member), in the language of `t`.
function roleFilter(t: Translate): TableFilter {
  return selectFilter({ options: ROLES.map((value) => ({ value, label: t(`roles.${value}`) })), multiple: true });
}
