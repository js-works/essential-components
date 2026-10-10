import { Alert, Button, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { clockStateOf, daySheet, nextClockActions } from '../../../domain';
import type { ClockAction, Employee, TimeData } from '../../../domain';
import { formatDuration } from '../../../shared/lib/format';
import { useLanguage, useTranslate } from '../../../shared/lib/i18n';
import { useNow } from '../../../shared/lib/useNow';
import { appIcons } from '../../../shared/ui/icons';
import { absenceText, ClockBadge } from '../../../shared/ui/parts';
import { useClock } from '../flows';
import { DayTimeline } from './DayTimeline';

export { ClockCard };

const ACTION_ICONS: Readonly<Record<ClockAction, ReactElement>> = {
  in: appIcons.clockIn,
  breakStart: appIcons.breakStart,
  breakEnd: appIcons.breakEnd,
  out: appIcons.clockOut,
};

// The viewer's clock: the time now (to the second), the state, the buttons that fit it (the main one filled), and today
// so far: worked against the day's target, the breaks, the timeline. Today's absence (e.g. a vacation day) is said, but
// the clock still works.
function ClockCard({ data, employee }: { data: TimeData; employee: Employee }): ReactElement {
  const t = useTranslate();
  const language = useLanguage();
  const now = useNow(1000);
  const { stamp, busy } = useClock();
  const sheet = daySheet(employee, now.date, data, now.date, now.time);
  const state = clockStateOf(sheet.entries);
  const actions = nextClockActions(state);
  const progress = sheet.target === 0 ? 0 : Math.min(100, (sheet.worked / sheet.target) * 100);

  return (
    <Paper withBorder p="lg" radius="sm">
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Stack gap={2}>
            <Text className="time-tracker__clock-time" aria-live="off">
              {now.value.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </Text>
            <Text size="sm" c="dimmed">
              {now.value.toLocaleDateString(language, { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </Stack>
          <ClockBadge state={state} />
        </Group>
        {sheet.absence !== undefined && !sheet.absence.pending && (
          <Alert variant="light" color="gray" p="xs">
            {t('clock.absentToday', { absence: absenceText(t, sheet.absence) })}
          </Alert>
        )}
        <Group gap="xs">
          {actions.map((action, index) => (
            <Button
              key={action}
              size="md"
              variant={index === 0 ? 'filled' : 'default'}
              leftSection={ACTION_ICONS[action]}
              loading={busy === action}
              disabled={busy !== undefined && busy !== action}
              onClick={() => void stamp(action)}
            >
              {t(`clock.action.${action}`)}
            </Button>
          ))}
        </Group>
        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="sm">
              {t('clock.workedToday')}{' '}
              <Text span fw={600} className="time-tracker__figures">{formatDuration(sheet.worked)}</Text>
              {sheet.target > 0 && (
                <Text span c="dimmed" className="time-tracker__figures">
                  {` / ${formatDuration(sheet.target)}`}
                </Text>
              )}
            </Text>
            <Text size="sm" c="dimmed">
              {t('clock.breaksToday')}{' '}
              <Text span className="time-tracker__figures">{formatDuration(sheet.breaks)}</Text>
            </Text>
          </Group>
          {sheet.target > 0 && <Progress value={progress} size="sm" aria-label={t('clock.workedToday')} />}
        </Stack>
        <DayTimeline entries={sheet.entries} now={now.time} />
      </Stack>
    </Paper>
  );
}
