import { selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import { CHECKLIST_KINDS } from '../../domain/index.js';
import type { Translate } from '../../shared/lib/i18n/index.js';

export { checklistKindFilter, checklistStateFilter };

// The filter of a checklist's kind: onboarding or offboarding; in the language of `t`.
function checklistKindFilter(t: Translate): TableFilter {
  return selectFilter({
    options: CHECKLIST_KINDS.map((value) => ({ value, label: t(`checklistKind.${value}`) })),
    multiple: true,
  });
}

// The filter of a checklist's state: open or complete; in the language of `t`.
function checklistStateFilter(t: Translate): TableFilter {
  return selectFilter({
    options: (['open', 'complete'] as const).map((value) => ({ value, label: t(`checklistState.${value}`) })),
    multiple: true,
  });
}
