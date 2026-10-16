import { selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import type { Translate } from '../../shared/lib/i18n/index.js';

export { leaveTypeFilter, requestStatusFilter };

// The filter of the type of a leave request: vacation, special, unpaid; in the language of `t`.
function leaveTypeFilter(t: Translate): TableFilter {
  return selectFilter({
    options: (['vacation', 'special', 'unpaid'] as const).map((value) => ({ value, label: t(`absence.${value}`) })),
    multiple: true,
  });
}

// The filter of the status of a request: pending, approved, rejected, cancelled; in the language of `t`.
function requestStatusFilter(t: Translate): TableFilter {
  return selectFilter({
    options: (['pending', 'approved', 'rejected', 'cancelled'] as const).map((value) => ({
      value,
      label: t(`status.${value}`),
    })),
    multiple: true,
  });
}
