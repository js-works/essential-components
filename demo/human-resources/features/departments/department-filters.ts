import type { TableFilter } from '@local/data-table/react';
import { selectFilter } from '@local/data-table/react';

import type { Department } from '../../domain/index.js';

export { departmentFilter };

// The filter of a department (by its name): the given departments, by name.
function departmentFilter(departments: readonly Department[]): TableFilter {
  return selectFilter({
    options: [...departments]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((department) => ({ value: department.name, label: department.name })),
    multiple: true,
  });
}
