import { Group, Text } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import type { ReactElement } from 'react';
import { absenceOn, isWeekend } from '../../../domain';
import type { AbsenceKind, TimeData } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { absenceColor, absenceText } from '../../../shared/ui/parts';

export { AbsenceLegend, MonthCalendar };

// The absences of one employee in Mantine's calendar (one or more months, it pages by itself): a dot below the day in
// the color of the absence (a pending one a ring), the kind as the day's tip. Static: nothing to pick.
function MonthCalendar({ data, employeeId, months = 1 }: {
  data: TimeData;
  employeeId: string;
  months?: number;
}): ReactElement {
  const t = useTranslate();

  return (
    <Calendar
      static
      numberOfColumns={months}
      highlightToday
      getDayProps={(date) => {
        const absence = absenceOn(employeeId, date, data);

        return absence === undefined || (isWeekend(date) && absence.kind !== 'sick')
          ? {}
          : { title: `${absenceText(t, absence)}${absence.pending ? ` (${t('status.pending')})` : ''}` };
      }}
      renderDay={(date) => {
        const absence = absenceOn(employeeId, date, data);
        const shown = absence !== undefined && !(isWeekend(date) && absence.kind !== 'sick');

        return (
          <span className="time-tracker__day">
            {Number(date.slice(8))}
            {shown && (
              <span
                className="time-tracker__day-dot"
                data-pending={absence.pending || undefined}
                style={{ color: absenceColor(absence.kind) }}
              />
            )}
          </span>
        );
      }}
    />
  );
}

// The colors of the kinds of absence, and the look of a pending one.
function AbsenceLegend({ kinds = ['vacation', 'special', 'unpaid', 'sick', 'holiday'] }: {
  kinds?: readonly AbsenceKind[];
}): ReactElement {
  const t = useTranslate();

  return (
    <Group gap="md" wrap="wrap">
      {kinds.map((kind) => (
        <Group key={kind} gap={6} wrap="nowrap">
          <span className="time-tracker__swatch" style={{ color: absenceColor(kind) }} />
          <Text size="xs">{absenceText(t, { kind, halfDay: 'none' })}</Text>
        </Group>
      ))}
      <Group gap={6} wrap="nowrap">
        <span className="time-tracker__swatch" data-pending style={{ color: absenceColor('vacation') }} />
        <Text size="xs">{t('status.pending')}</Text>
      </Group>
    </Group>
  );
}
