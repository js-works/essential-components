import { ActionIcon, Button, Group, Loader, NativeSelect, Stack, Text, Tooltip } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { todayDate } from '../../../domain';
import { formatMonth } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader } from '../../../shared/ui/parts';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { AbsenceLegend } from '../components/MonthCalendar';
import { TeamGrid } from '../components/TeamGrid';

export { CalendarPage };

// The team calendar: who is off when in a month, for the viewer's team (the default), one other team, or all.
function CalendarPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const today = todayDate();
  const [month, setMonth] = useState({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) });
  const [teamId, setTeamId] = useState<string>();

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  const ownTeam = data.employees.find((employee) => employee.id === viewer.employeeId)?.teamId;
  const chosen = teamId ?? ownTeam ?? 'all';
  const teams = chosen === 'all' ? data.teams : data.teams.filter((team) => team.id === chosen);
  const step = (delta: number) =>
    setMonth(({ year, month: current }) => {
      const index = year * 12 + (current - 1) + delta;

      return { year: Math.floor(index / 12), month: (index % 12) + 1 };
    });
  const thisMonth = month.year === Number(today.slice(0, 4)) && month.month === Number(today.slice(5, 7));

  return (
    <Stack gap="md">
      <PageHeader
        title={t('calendar.title')}
        subtitle={t('calendar.subtitle')}
        actions={
          <NativeSelect
            aria-label={t('calendar.team')}
            data={[
              { value: 'all', label: t('calendar.allTeams') },
              ...data.teams.map((team) => ({ value: team.id, label: team.name })),
            ]}
            value={chosen}
            onChange={(event) => setTeamId(event.currentTarget.value)}
          />
        }
      />
      <Group justify="space-between" gap="sm">
        <Group gap="xs">
          <Tooltip label={t('calendar.previousMonth')} fz="xs">
            <ActionIcon variant="default" aria-label={t('calendar.previousMonth')} onClick={() => step(-1)}>
              {appIcons.previous}
            </ActionIcon>
          </Tooltip>
          <Tooltip label={t('calendar.nextMonth')} fz="xs">
            <ActionIcon variant="default" aria-label={t('calendar.nextMonth')} onClick={() => step(1)}>
              {appIcons.next}
            </ActionIcon>
          </Tooltip>
          <Button
            variant="default"
            size="xs"
            disabled={thisMonth}
            onClick={() => setMonth({ year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) })}
          >
            {t('calendar.thisMonth')}
          </Button>
          <Text fw={500}>{formatMonth(month.year, month.month)}</Text>
        </Group>
        <AbsenceLegend />
      </Group>
      <TeamGrid data={data} teams={teams} year={month.year} month={month.month} today={today} />
    </Stack>
  );
}
