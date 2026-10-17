import type { TableFilter } from '@local/data-table/react';
import { selectFilter } from '@local/data-table/react';

import type { Team } from '../../domain/index.js';
import type { Translate } from '../../shared/lib/i18n/index.js';

export { employeeStatusFilter, teamFilter, todayFilter };

// The filter of an employee's team (by its name): the given teams.
function teamFilter(teams: readonly Team[]): TableFilter {
  return selectFilter({ options: teams.map((team) => ({ value: team.name, label: team.name })), multiple: true });
}

// The filter of where an employee is today: the clock's states and the absences; in the language of `t`.
function todayFilter(t: Translate): TableFilter {
  return selectFilter({
    options: [
      ...(['working', 'break', 'out'] as const).map((value) => ({ value, label: t(`clockState.${value}`) })),
      ...(['vacation', 'special', 'unpaid', 'sick', 'holiday'] as const).map((value) => ({
        value,
        label: t(`absence.${value}`),
      })),
    ],
    multiple: true,
  });
}

// The filter of an employee's status: active or inactive; in the language of `t`.
function employeeStatusFilter(t: Translate): TableFilter {
  return selectFilter({
    options: (['active', 'inactive'] as const).map((value) => ({ value, label: t(`employees.${value}`) })),
    multiple: true,
  });
}
