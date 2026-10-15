import { autocompleteFilter, selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import { ROLES } from '../../domain/index.js';
import { suggestPeople } from '../../infra/in-memory/index.js';
import type { Translate } from '../../shared/lib/i18n/index.js';
import { suggestion } from '../../shared/ui/suggestion.js';

export { personFilter, roleFilter };

// The filter of every column of a person (by name, the value is the name): an autocomplete, all options when the list
// opens (`minQueryLength: 0`), each with the person's organization as its second line.
const personFilter = autocompleteFilter({
  multiple: true,
  minQueryLength: 0,
  load: async (query, signal) =>
    (await suggestPeople(query, signal)).map(({ description, ...option }) => ({
      ...option,
      value: option.label,
      content: suggestion(option.label, description),
    })),
});

// The filter of a role on a board (chair, vice chair, secretary, member), in the language of `t`.
function roleFilter(t: Translate): TableFilter {
  return selectFilter({ options: ROLES.map((value) => ({ value, label: t(`roles.${value}`) })), multiple: true });
}
