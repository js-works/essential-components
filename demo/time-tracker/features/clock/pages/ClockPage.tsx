import { Anchor, Grid, Group, Loader, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { addDays, daySheet, weekStart } from '../../../domain';
import type { Employee, TimeData } from '../../../domain';
import { formatDuration } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { useNow } from '../../../shared/lib/useNow';
import { PageHeader } from '../../../shared/ui/parts';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { ClockCard } from '../components/ClockCard';
import { DayEntries } from '../components/DayTimeline';

export { ClockPage, WeekSoFar };

// The time clock: the viewer's clock, today's stretches, and the week so far.
function ClockPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const { employeeId } = useViewer();
  const now = useNow(30_000);
  const employee = data?.employees.find((candidate) => candidate.id === employeeId);

  return (
    <Stack gap="md">
      <PageHeader title={t('clock.title')} subtitle={t('clock.subtitle')} />
      {data === undefined || employee === undefined ? <Loader size="sm" /> : (
        <Grid gap="md">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <ClockCard data={data} employee={employee} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Stack gap="md">
              <Paper withBorder p="md" radius="sm">
                <Title order={3} size="h5" mb="xs">{t('clock.today')}</Title>
                <DayEntries entries={daySheet(employee, now.date, data, now.date, now.time).entries} now={now.time} />
              </Paper>
              <WeekSoFar data={data} employee={employee} today={now.date} time={now.time} />
            </Stack>
          </Grid.Col>
        </Grid>
      )}
    </Stack>
  );
}

// This week up to today: worked against the target, and the balance; a link to the timesheet.
function WeekSoFar({ data, employee, today, time }: {
  data: TimeData;
  employee: Employee;
  today: string;
  time: string;
}): ReactElement {
  const t = useTranslate();
  const monday = weekStart(today);
  const days = [0, 1, 2, 3, 4].map((offset) => addDays(monday, offset)).filter((date) => date <= today);
  const sheets = days.map((date) => daySheet(employee, date, data, today, time));
  const worked = sheets.reduce((sum, sheet) => sum + sheet.worked, 0);
  const target = sheets.reduce((sum, sheet) => sum + sheet.target, 0);
  const balance = worked - target;

  return (
    <Paper withBorder p="md" radius="sm">
      <Group justify="space-between" mb="xs">
        <Title order={3} size="h5">{t('clock.thisWeek')}</Title>
        <Anchor component={Link} to="/timesheet" size="sm">{t('clock.openTimesheet')}</Anchor>
      </Group>
      <Group gap="xl">
        <Stack gap={0}>
          <Text size="xs" c="dimmed">{t('sheet.worked')}</Text>
          <Text fw={600} className="time-tracker__figures">{formatDuration(worked)}</Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">{t('sheet.target')}</Text>
          <Text fw={600} className="time-tracker__figures">{formatDuration(target)}</Text>
        </Stack>
        <Stack gap={0}>
          <Text size="xs" c="dimmed">{t('sheet.balance')}</Text>
          <Text
            fw={600}
            className="time-tracker__balance"
            data-sign={balance > 0 ? 'plus' : balance < 0 ? 'minus' : undefined}
          >
            {formatDuration(balance, { sign: true })}
          </Text>
        </Stack>
      </Group>
    </Paper>
  );
}
