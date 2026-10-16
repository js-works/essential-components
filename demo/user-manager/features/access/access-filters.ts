import { selectFilter } from '@local/data-table/react';

export { principalTypeFilter };

// The filter of who a grant is for: a user or a group.
const principalTypeFilter = selectFilter({
  options: [{ value: 'User', label: 'User' }, { value: 'Group', label: 'Group' }],
  multiple: true,
});
