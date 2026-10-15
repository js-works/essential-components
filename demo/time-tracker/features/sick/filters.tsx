import { selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import type { Translate } from '../../shared/lib/i18n/index.js';

export { certificateFilter };

// The filter of the doctor's note of a sick call: uploaded, missing, not needed; in the language of `t`.
function certificateFilter(t: Translate): TableFilter {
  return selectFilter({
    options: (['uploaded', 'missing', 'notNeeded'] as const).map((value) => ({
      value,
      label: t(`sick.certificate.${value}`),
    })),
    multiple: true,
  });
}
