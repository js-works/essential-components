import { Anchor, Group, Text } from '@mantine/core';
import { Fragment } from 'react';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { absenceOn, isWeekend, monthDates } from '../../../domain';
import type { Employee, Team, TimeData } from '../../../domain';
import { formatDate, formatWeekday } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { absenceColor, absenceText, EmployeeAvatar } from '../../../shared/ui/parts';

export { TeamGrid };

// Who is off when: a row per employee (by team), a column per day of the month. A day off is a block in the color of
// its kind (a pending leave striped, a half day half filled), with its kind and date as the tip; weekends shaded, today
// framed. The names stay at the left while the days scroll, the days at the top.
function TeamGrid({ data, teams, year, month, today }: {
  data: TimeData;
  teams: readonly Team[];
  year: number;
  month: number;
  today: string;
}): ReactElement {
  const t = useTranslate();
  const dates = monthDates(year, month);
  const rowsOf = (team: Team): Employee[] =>
    data.employees
      .filter((employee) => employee.teamId === team.id && employee.active)
      .sort((a, b) => (a.id === team.leadId ? -1 : b.id === team.leadId ? 1 : a.name.localeCompare(b.name)));

  return (
    <div className="time-tracker__grid-scroll">
      <div
        className="time-tracker__grid"
        style={{ gridTemplateColumns: `minmax(11rem, 14rem) repeat(${dates.length}, minmax(1.75rem, 1fr))` }}
        role="table"
        aria-label={t('calendar.gridLabel')}
      >
        <div className="time-tracker__grid-head" data-corner role="columnheader">{t('calendar.employee')}</div>
        {dates.map((date) => (
          <div
            key={date}
            className="time-tracker__grid-head"
            data-weekend={isWeekend(date) || undefined}
            data-today={date === today || undefined}
            role="columnheader"
            aria-label={formatDate(date)}
          >
            <span>{formatWeekday(date, 'narrow')}</span>
            <span>{Number(date.slice(8))}</span>
          </div>
        ))}
        {teams.map((team) => (
          <Fragment key={team.id}>
            <div className="time-tracker__grid-group" style={{ gridColumn: '1 / -1' }}>{team.name}</div>
            {rowsOf(team).map((employee) => (
              <Fragment key={employee.id}>
                <div className="time-tracker__grid-name" role="rowheader">
                  <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
                    <EmployeeAvatar name={employee.name} size={20} />
                    <Anchor component={Link} to={`/employees/${employee.id}`} size="xs" truncate>
                      {employee.name}
                    </Anchor>
                  </Group>
                </div>
                {dates.map((date) => {
                  const absence = absenceOn(employee.id, date, data);
                  const weekend = isWeekend(date);
                  const shown = absence !== undefined && !(weekend && absence.kind !== 'sick');

                  return (
                    <div
                      key={date}
                      className="time-tracker__grid-day"
                      data-weekend={weekend || undefined}
                      data-today={date === today || undefined}
                      role="cell"
                    >
                      {shown && (
                        <span
                          data-pending={absence.pending || undefined}
                          data-half={absence.halfDay === 'none' ? undefined : absence.halfDay}
                          style={{ color: absenceColor(absence.kind) }}
                          title={`${employee.name}: ${absenceText(t, absence)}${
                            absence.pending ? ` (${t('status.pending')})` : ''
                          }, ${formatDate(date)}`}
                        />
                      )}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </Fragment>
        ))}
      </div>
      {teams.length === 0 && <Text size="sm" c="dimmed" p="md">{t('calendar.noTeams')}</Text>}
    </div>
  );
}
