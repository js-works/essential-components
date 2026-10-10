import { Group, Table, Text, Tooltip } from '@mantine/core';
import type { ReactElement } from 'react';
import { minutesOf } from '../../../domain';
import type { TimeEntry } from '../../../domain';
import { formatDuration, formatTime } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';

export { DayEntries, DayTimeline };

// The hours a timeline shows: 6:00 to 22:00 (earlier or later stamps are cut off at its ends).
const FIRST = 6 * 60;
const LAST = 22 * 60;

const share = (minutes: number) => `${((Math.min(LAST, Math.max(FIRST, minutes)) - FIRST) / (LAST - FIRST)) * 100}%`;

// A day as a bar: the work in the accent, the breaks in the warning color, the open stretch faded; the hours below.
function DayTimeline({ entries, now }: { entries: readonly TimeEntry[]; now: string }): ReactElement {
  const t = useTranslate();

  return (
    <div>
      <div className="time-tracker__timeline" role="img" aria-label={t('clock.timeline')}>
        {entries.map((entry) => {
          const start = minutesOf(entry.start);
          const end = minutesOf(entry.end ?? now);

          return (
            <Tooltip
              key={entry.id}
              label={`${t(`entry.${entry.kind}`)}: ${formatTime(entry.start)} – ${
                entry.end === null ? t('clock.now') : formatTime(entry.end)
              }`}
              fz="xs"
            >
              <span
                data-kind={entry.kind}
                data-open={entry.end === null || undefined}
                style={{ left: share(start), width: `calc(${share(end)} - ${share(start)})` }}
              />
            </Tooltip>
          );
        })}
      </div>
      <Group justify="space-between" mt={4}>
        {['06:00', '10:00', '14:00', '18:00', '22:00'].map((time) => (
          <Text key={time} size="xs" c="dimmed" className="time-tracker__figures">{formatTime(time)}</Text>
        ))}
      </Group>
    </div>
  );
}

// The stretches of a day, one per line: work or break, from, to (or "now"), how long.
function DayEntries({ entries, now }: { entries: readonly TimeEntry[]; now: string }): ReactElement {
  const t = useTranslate();

  if (entries.length === 0) {
    return <Text size="sm" c="dimmed">{t('clock.noEntries')}</Text>;
  }

  return (
    <Table verticalSpacing={6} className="time-tracker__figures">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>{t('entry.kind')}</Table.Th>
          <Table.Th>{t('entry.start')}</Table.Th>
          <Table.Th>{t('entry.end')}</Table.Th>
          <Table.Th ta="end">{t('entry.duration')}</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {entries.map((entry) => (
          <Table.Tr key={entry.id}>
            <Table.Td>
              {t(`entry.${entry.kind}`)}
              {entry.source === 'correction' && <Text span size="xs" c="dimmed">{` · ${t('entry.corrected')}`}</Text>}
            </Table.Td>
            <Table.Td>{formatTime(entry.start)}</Table.Td>
            <Table.Td>{entry.end === null ? t('clock.now') : formatTime(entry.end)}</Table.Td>
            <Table.Td ta="end">{formatDuration(minutesOf(entry.end ?? now) - minutesOf(entry.start))}</Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
