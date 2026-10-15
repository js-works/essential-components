import { selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import { DOCUMENT_CATEGORIES, EMPLOYEE_STATUSES, EMPLOYMENT_TYPES } from '../../domain/index.js';
import type { Employee } from '../../domain/index.js';
import type { Translate } from '../../shared/lib/i18n/index.js';

export { documentCategoryFilter, employeeStatusFilter, employmentTypeFilter, locationFilter };

// The filter of the category of an employee's document, in the language of `t`.
function documentCategoryFilter(t: Translate): TableFilter {
  return selectFilter({
    options: DOCUMENT_CATEGORIES.map((value) => ({ value, label: t(`documentCategory.${value}`) })),
    multiple: true,
  });
}

// The filter of an employee's place of work: the places the given employees have, sorted.
function locationFilter(employees: readonly Employee[]): TableFilter {
  const locations = [...new Set(employees.map((employee) => employee.location))].sort();

  return selectFilter({ options: locations.map((location) => ({ value: location, label: location })), multiple: true });
}

// The filter of an employee's contract: full time, part time, …; in the language of `t`.
function employmentTypeFilter(t: Translate): TableFilter {
  return selectFilter({
    options: EMPLOYMENT_TYPES.map((value) => ({ value, label: t(`employmentType.${value}`) })),
    multiple: true,
  });
}

// The filter of an employee's status: joining, active, leaving, former; in the language of `t`.
function employeeStatusFilter(t: Translate): TableFilter {
  return selectFilter({
    options: EMPLOYEE_STATUSES.map((value) => ({ value, label: t(`employeeStatus.${value}`) })),
    multiple: true,
  });
}
