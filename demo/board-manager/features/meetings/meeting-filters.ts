import { selectFilter } from '@local/data-table/react';
import type { TableFilter } from '@local/data-table/react';
import { MEETING_STATUSES } from '../../domain/index.js';
import type { Translate } from '../../shared/lib/i18n/index.js';

export { documentTypeFilter, meetingStatusFilter, minutesFilter };

// The filter of the status of a meeting, in the language of `t`.
function meetingStatusFilter(t: Translate): TableFilter {
  return selectFilter({
    options: MEETING_STATUSES.map((value) => ({ value, label: t(`statuses.${value}`) })),
    multiple: true,
  });
}

// The filter of the minutes of held meetings: approved or a draft, in the language of `t`.
function minutesFilter(t: Translate): TableFilter {
  return selectFilter({
    options: [
      { value: 'approved', label: t('meetings.minutesApprovedBadge') },
      { value: 'draft', label: t('meetings.minutesDraftBadge') },
    ],
    multiple: true,
  });
}

// The filter of the type of a meeting's document.
const documentTypeFilter = selectFilter({ options: ['PDF', 'DOCX', 'PPTX', 'XLSX'], multiple: true });
