import { selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import { CANDIDATE_SOURCES, OPENING_STATUSES, STAGES } from '../../domain/index.js';
import type { Translate } from '../../shared/lib/i18n/index.js';

export { candidateSourceFilter, openingStatusFilter, stageFilter };

// The filter of a candidate's stage, in the language of `t`.
function stageFilter(t: Translate): TableFilter {
  return selectFilter({ options: STAGES.map((value) => ({ value, label: t(`stage.${value}`) })), multiple: true });
}

// The filter of where a candidate came from, in the language of `t`.
function candidateSourceFilter(t: Translate): TableFilter {
  return selectFilter({
    options: CANDIDATE_SOURCES.map((value) => ({ value, label: t(`source.${value}`) })),
    multiple: true,
  });
}

// The filter of an opening's status: open, on hold, closed; in the language of `t`.
function openingStatusFilter(t: Translate): TableFilter {
  return selectFilter({
    options: OPENING_STATUSES.map((value) => ({ value, label: t(`openingStatus.${value}`) })),
    multiple: true,
  });
}
