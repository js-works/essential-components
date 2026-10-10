import { ActionIcon, Table, Text, Tooltip } from '@mantine/core';
import type { ReactElement } from 'react';
import { addDays, daySheet } from '../../../domain';
import type { DaySheet, Employee, TimeData } from '../../../domain';
import { formatDayShort, formatDuration, formatTime } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { AbsenceBadge } from '../../../shared/ui/parts';

export { Balance, WeekSheet, weekSheets };

// The seven days of a week from its Monday.
function weekSheets(employee: Employee, monday: string, data: TimeData, today: string, now: string): DaySheet[] {
  return [0, 1, 2, 3, 4, 5, 6].map((offset) => daySheet(employee, addDays(monday, offset), data, today, now));
}

// A balance of minutes: green above zero, red below, with its sign.
function Balance({ minutes }: { minutes: number | null }): ReactElement {
  return minutes === null
    ? <Text span c="dimmed">–</Text>
    : (
      <Text span className="time-tracker__balance" data-sign={minutes > 0 ? 'plus' : minutes < 0 ? 'minus' : undefined}>
        {formatDuration(minutes, { sign: true })}
      </Text>
    );
}

// A week of an employee, a row per day: the first and the last stamp, the breaks, worked, the target, the balance and
// the absence; the totals below. A day off (a weekend, an absence without work) is dimmed, today marked. `onCorrect`:
// a button on a past day to request a correction (the viewer's own week).
function WeekSheet({ sheets, today, onCorrect }: {
  sheets: readonly DaySheet[];
  today: string;
  onCorrect?: (date: string) => void;
}): ReactElement {
  const t = useTranslate();
  const sum = (pick: (sheet: DaySheet) => number) => sheets.reduce((total, sheet) => total + pick(sheet), 0);
  const balance = sheets.some((sheet) => sheet.balance !== null) ? sum((sheet) => sheet.balance ?? 0) : null;

  return (
    <Table.ScrollContainer minWidth={640}>
      <Table className="time-tracker__week time-tracker__figures" verticalSpacing={8}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('sheet.day')}</Table.Th>
            <Table.Th>{t('sheet.from')}</Table.Th>
            <Table.Th>{t('sheet.to')}</Table.Th>
            <Table.Th ta="end">{t('sheet.breaks')}</Table.Th>
            <Table.Th ta="end">{t('sheet.worked')}</Table.Th>
            <Table.Th ta="end">{t('sheet.target')}</Table.Th>
            <Table.Th ta="end">{t('sheet.balance')}</Table.Th>
            <Table.Th>{t('sheet.absence')}</Table.Th>
            {onCorrect !== undefined && <Table.Th w={40} />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {sheets.map((sheet) => {
            const first = sheet.entries[0];
            const last = sheet.entries.at(-1);
            const off = sheet.target === 0 && sheet.worked === 0;

            return (
              <Table.Tr key={sheet.date} data-off={off || undefined} data-today={sheet.date === today || undefined}>
                <Table.Td>{formatDayShort(sheet.date)}</Table.Td>
                <Table.Td>{first === undefined ? '' : formatTime(first.start)}</Table.Td>
                <Table.Td>
                  {last === undefined ? '' : last.end === null ? t('clock.now') : formatTime(last.end)}
                </Table.Td>
                <Table.Td ta="end">{sheet.breaks === 0 ? '' : formatDuration(sheet.breaks)}</Table.Td>
                <Table.Td ta="end">{sheet.worked === 0 && off ? '' : formatDuration(sheet.worked)}</Table.Td>
                <Table.Td ta="end">{sheet.target === 0 ? '' : formatDuration(sheet.target)}</Table.Td>
                <Table.Td ta="end">{off && sheet.balance === 0 ? '' : <Balance minutes={sheet.balance} />}</Table.Td>
                <Table.Td>{sheet.absence !== undefined && <AbsenceBadge absence={sheet.absence} />}</Table.Td>
                {onCorrect !== undefined && (
                  <Table.Td>
                    {sheet.date < today && (
                      <Tooltip label={t('correction.request')} fz="xs">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          aria-label={t('correction.request')}
                          onClick={() => onCorrect(sheet.date)}
                        >
                          {appIcons.correction}
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Table.Td>
                )}
              </Table.Tr>
            );
          })}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr>
            <Table.Th colSpan={3}>{t('sheet.total')}</Table.Th>
            <Table.Th ta="end">{formatDuration(sum((sheet) => sheet.breaks))}</Table.Th>
            <Table.Th ta="end">{formatDuration(sum((sheet) => sheet.worked))}</Table.Th>
            <Table.Th ta="end">{formatDuration(sum((sheet) => sheet.target))}</Table.Th>
            <Table.Th ta="end">
              <Balance minutes={balance} />
            </Table.Th>
            <Table.Th colSpan={onCorrect === undefined ? 1 : 2} />
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Table.ScrollContainer>
  );
}
