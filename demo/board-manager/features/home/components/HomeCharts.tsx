import { BarChart, DonutChart } from '@mantine/charts';
import { Paper, RingProgress, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMemo } from 'react';
import type { ReactElement } from 'react';
import { MEETING_STATUSES, ROLES } from '../../../domain';
import type { Meeting, MeetingStatus } from '../../../domain';
import { useLanguage, useTranslate } from '../../../shared/lib/i18n';
import { useDb } from '../../../shared/shared';

export { HomeCharts };

const STATUS_COLORS: Record<MeetingStatus, string> = { Planned: 'blue.6', Held: 'teal.6', Cancelled: 'gray.5' };
const MONTHS_BEFORE = 6;
const MONTHS_AFTER = 5;

// The charts of the start page (`@mantine/charts`): meetings per month and per board, stacked by status, and the share
// of each status. The series are named by the translated status.
function HomeCharts(): ReactElement {
  const t = useTranslate();
  const language = useLanguage();
  const boards = useDb((state) => state.boards);
  const meetings = useDb((state) => state.meetings);

  const { series, months, perBoard, byStatus } = useMemo(() => {
    const name = (status: MeetingStatus) => t(`statuses.${status}`);
    const now = new Date();
    const format = new Intl.DateTimeFormat(language, { month: 'short' });

    return {
      series: MEETING_STATUSES.map((status) => ({ name: name(status), color: STATUS_COLORS[status] })),
      months: Array.from({ length: MONTHS_BEFORE + MONTHS_AFTER + 1 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - MONTHS_BEFORE + index, 1);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        return row(format.format(date), meetings.filter((meeting) => meeting.start.startsWith(key)), name);
      }),
      perBoard: boards
        .map((board) => ({ ...row(board.name, meetings.filter((meeting) => meeting.boardId === board.id), name) }))
        .sort((a, b) => total(b) - total(a))
        .slice(0, 6),
      byStatus: MEETING_STATUSES.map((status) => ({
        name: name(status),
        value: meetings.filter((meeting) => meeting.status === status).length,
        color: STATUS_COLORS[status],
      })),
    };
  }, [boards, meetings, language, t]);

  return (
    <div className="board-manager-home-charts">
      <Paper withBorder p="md" radius="sm" className="board-manager-home-charts__wide">
        <Stack gap="sm">
          <Text fw={600}>{t('home.meetingsPerMonth')}</Text>
          <BarChart h={200} type="stacked" data={months} dataKey="label" series={series} withLegend />
        </Stack>
      </Paper>
      <Paper withBorder p="md" radius="sm">
        <Stack gap="sm" align="center">
          <Text fw={600} className="board-manager-home-charts__title">{t('home.byStatus')}</Text>
          <DonutChart data={byStatus} size={150} thickness={18} withLabelsLine={false} />
        </Stack>
      </Paper>
      <Paper withBorder p="md" radius="sm" className="board-manager-home-charts__wide">
        <Stack gap="sm">
          <Text fw={600}>{t('home.meetingsPerBoard')}</Text>
          <BarChart
            h={Math.max(120, perBoard.length * 36)}
            type="stacked"
            orientation="vertical"
            data={perBoard}
            dataKey="label"
            series={series}
            withLegend
            yAxisProps={{ width: 140 }}
          />
        </Stack>
      </Paper>
      <MoreCharts />
    </div>
  );
}

// More figures in the accent color: the roles, the weekdays of the meetings, the people per organization and the
// share of approved minutes.
function MoreCharts(): ReactElement {
  const t = useTranslate();
  const language = useLanguage();
  const { primaryColor } = useMantineTheme();
  const meetings = useDb((state) => state.meetings);
  const memberships = useDb((state) => state.memberships);
  const people = useDb((state) => state.people);
  const organizations = useDb((state) => state.organizations);
  const accent = `${primaryColor}.6`;

  const { roles, weekdays, perOrganization, held, approved } = useMemo(() => {
    const shades = [9, 7, 5, 3];
    const weekday = new Intl.DateTimeFormat(language, { weekday: 'short' });
    // 2024-01-01 is a Monday.
    const names = Array.from({ length: 7 }, (_, index) => weekday.format(new Date(2024, 0, 1 + index)));
    const heldMeetings = meetings.filter((meeting) => meeting.status === 'Held');

    return {
      roles: ROLES.map((role, index) => ({
        name: t(`roles.${role}`),
        value: memberships.filter((membership) => membership.role === role).length,
        color: `${primaryColor}.${shades[index] ?? 3}`,
      })),
      weekdays: names.map((label, index) => ({
        label,
        [t('modules.meetings')]: meetings.filter((meeting) => (new Date(meeting.start).getDay() + 6) % 7 === index)
          .length,
      })),
      perOrganization: organizations
        .map((organization) => ({
          label: organization.name,
          [t('modules.members')]: people.filter((person) => person.organizationId === organization.id).length,
        }))
        .sort((a, b) => Number(b[t('modules.members')]) - Number(a[t('modules.members')]))
        .slice(0, 6),
      held: heldMeetings.length,
      approved: heldMeetings.filter((meeting) => meeting.minutesApproved).length,
    };
  }, [language, meetings, memberships, people, organizations, primaryColor, t]);

  return (
    <>
      <Paper withBorder p="md" radius="sm">
        <Stack gap="sm" align="center">
          <Text fw={600} className="board-manager-home-charts__title">{t('home.roles')}</Text>
          <DonutChart data={roles} size={150} thickness={18} withLabelsLine={false} />
        </Stack>
      </Paper>
      <Paper withBorder p="md" radius="sm">
        <Stack gap="sm" align="center">
          <Text fw={600} className="board-manager-home-charts__title">{t('home.minutesApproved')}</Text>
          <RingProgress
            size={150}
            thickness={16}
            sections={[{ value: held === 0 ? 0 : (approved / held) * 100, color: accent }]}
            label={
              <Stack gap={0} align="center">
                <Text fw={700} size="xl" lh={1}>{held === 0 ? 0 : Math.round((approved / held) * 100)}%</Text>
                <Text size="xs" c="dimmed">{approved} / {held}</Text>
              </Stack>
            }
          />
        </Stack>
      </Paper>
      <Paper withBorder p="md" radius="sm" className="board-manager-home-charts__wide">
        <Stack gap="sm">
          <Text fw={600}>{t('home.byWeekday')}</Text>
          <BarChart
            h={180}
            data={weekdays}
            dataKey="label"
            series={[{ name: t('modules.meetings'), color: accent }]}
          />
        </Stack>
      </Paper>
      <Paper withBorder p="md" radius="sm" className="board-manager-home-charts__wide">
        <Stack gap="sm">
          <Text fw={600}>{t('home.peoplePerOrganization')}</Text>
          <BarChart
            h={Math.max(120, perOrganization.length * 36)}
            orientation="vertical"
            data={perOrganization}
            dataKey="label"
            series={[{ name: t('modules.members'), color: accent }]}
            yAxisProps={{ width: 140 }}
          />
        </Stack>
      </Paper>
    </>
  );
}

// One data row: the label and a count per status (the key is the translated status).
function row(label: string, meetings: readonly Meeting[], name: (status: MeetingStatus) => string) {
  const data: Record<string, string | number> = { label };

  for (const status of MEETING_STATUSES) {
    data[name(status)] = meetings.filter((meeting) => meeting.status === status).length;
  }

  return data;
}

function total(data: Record<string, string | number>): number {
  return Object.values(data).reduce<number>((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
}
