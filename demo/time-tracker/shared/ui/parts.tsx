import { Alert, Anchor, Avatar, Badge, Group, Paper, Stack, Text, Title } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';
import type { Absence, AbsenceKind, ClockState, Employee, RequestStatus, TodayStatus } from '../../domain';
import { useTranslate } from '../lib/i18n';
import type { TextKey } from '../lib/i18n';
import { appIcons } from './icons';

export {
  AbsenceBadge,
  absenceColor,
  absenceText,
  ClockBadge,
  EmployeeAvatar,
  EmployeeLabel,
  LeadOnly,
  PageHeader,
  RequestStatusBadge,
  StatCard,
  TodayBadge,
};

// The parts of the pages: the header, an employee's avatar and name, the badges of absences, requests and the clock,
// and the cards of the overview.

// The title of a page, its subtitle, and its actions on the right.
function PageHeader({ title, subtitle, badges, actions }: {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
}): ReactElement {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm" className="time-tracker__page-header">
      <Stack gap={4}>
        <Group gap="xs">
          <Title order={2} size="h3">{title}</Title>
          {badges}
        </Group>
        {subtitle !== undefined && <Text size="sm" c="dimmed">{subtitle}</Text>}
      </Stack>
      {actions !== undefined && <Group gap="xs">{actions}</Group>}
    </Group>
  );
}

// An employee's initials in a circle, in a color from their name.
function EmployeeAvatar({ name, size = 26 }: { name: string; size?: number }): ReactElement {
  return <Avatar name={name} color="initials" size={size} radius="xl" />;
}

// An employee (avatar) with their name as a link to their page, and their title below it (`title`).
function EmployeeLabel({ employee, title = false }: { employee: Employee; title?: boolean }): ReactElement {
  return (
    <Group gap={8} wrap="nowrap">
      <EmployeeAvatar name={employee.name} size={title ? 26 : 22} />
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Anchor component={Link} to={`/employees/${employee.id}`} size="sm" truncate>{employee.name}</Anchor>
        {title && <Text size="xs" c="dimmed" truncate>{employee.title}</Text>}
      </Stack>
    </Group>
  );
}

// The colors of the kinds of absence (Mantine's colors of the theme): in the calendars and the legend (not in the
// pills, which are all in the accent).
const ABSENCE_COLORS: Readonly<Record<AbsenceKind, string>> = {
  vacation: 'accent',
  special: 'teal',
  unpaid: 'grape',
  sick: 'danger',
  holiday: 'gray',
};

// The color of an absence as a CSS value (Mantine's variable of its filled shade), for the blocks of the team calendar,
// the dots of the month calendar and the legend: set inline as their `color` (no custom property of our own). Public
// holidays in a light gray.
function absenceColor(kind: AbsenceKind): string {
  return kind === 'holiday' ? 'var(--mantine-color-gray-5)' : `var(--mantine-color-${ABSENCE_COLORS[kind]}-filled)`;
}

const ABSENCE_KEYS: Readonly<Record<AbsenceKind, TextKey>> = {
  vacation: 'absence.vacation',
  special: 'absence.special',
  unpaid: 'absence.unpaid',
  sick: 'absence.sick',
  holiday: 'absence.holiday',
};

function absenceText(t: ReturnType<typeof useTranslate>, absence: Pick<Absence, 'kind' | 'halfDay'>): string {
  const kind = t(ABSENCE_KEYS[absence.kind]);

  return absence.halfDay === 'none' ? kind : t('absence.half', { kind, half: t(`halfDay.${absence.halfDay}`) });
}

// The pills (2026-10-07, the user's wish, like the Board Manager's): only in the accent, their variant tells the states
// apart (`filled` the one that matters most, `outline` the open or provisional one, `light` the rest), and gray only
// for what is over or out. The calendars keep the colors of the kinds of absence.
type Pill = { variant: 'filled' | 'light' | 'outline'; color?: 'gray' };

// A kind of absence; a pending one outlined (it does not count yet).
function AbsenceBadge({ absence }: { absence: Pick<Absence, 'kind' | 'halfDay' | 'pending'> }): ReactElement {
  const t = useTranslate();

  return (
    <Badge variant={absence.pending ? 'outline' : 'light'}>
      {absenceText(t, absence)}
      {absence.pending && ` · ${t('status.pending')}`}
    </Badge>
  );
}

const STATUS_PILLS: Readonly<Record<RequestStatus, Pill>> = {
  pending: { variant: 'outline' },
  approved: { variant: 'filled' },
  rejected: { variant: 'light' },
  cancelled: { variant: 'light', color: 'gray' },
};

function RequestStatusBadge({ status }: { status: RequestStatus }): ReactElement {
  const t = useTranslate();

  return <Badge {...STATUS_PILLS[status]}>{t(`status.${status}`)}</Badge>;
}

const CLOCK_PILLS: Readonly<Record<ClockState, Pill>> = {
  working: { variant: 'filled' },
  break: { variant: 'outline' },
  out: { variant: 'light', color: 'gray' },
};

function ClockBadge({ state }: { state: ClockState }): ReactElement {
  const t = useTranslate();

  return <Badge {...CLOCK_PILLS[state]}>{t(`clockState.${state}`)}</Badge>;
}

// Where someone is today: the clock, or their absence.
function TodayBadge({ status }: { status: TodayStatus }): ReactElement {
  return status.kind === 'clock' ? <ClockBadge state={status.state} /> : <AbsenceBadge absence={status.absence} />;
}

// A page only for a team lead, opened as an employee (e.g. by its link): what it is, and how to see it.
function LeadOnly(): ReactElement {
  const t = useTranslate();

  return (
    <Alert variant="light" color="gray" title={t('shell.leadOnlyTitle')} maw={560}>
      {t('shell.leadOnlyText')}
    </Alert>
  );
}

// A card of the overview: a label, a big value, a line below it; links to a page (`to`).
function StatCard({ label, value, detail, to, toLabel }: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  to?: string;
  // The name of the page the card opens, shown at its top right.
  toLabel?: string;
}): ReactElement {
  const content = (
    <Stack gap={4}>
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{label}</Text>
        {to !== undefined && toLabel !== undefined && (
          <Text size="xs" className="time-tracker__card-target">
            {toLabel}
            {appIcons.target}
          </Text>
        )}
      </Group>
      <Text fz={28} fw={600} lh={1.2}>{value}</Text>
      {detail !== undefined && <Text size="sm" c="dimmed">{detail}</Text>}
    </Stack>
  );

  return to === undefined
    ? <Paper withBorder p="md" radius="sm" className="time-tracker__card">{content}</Paper>
    : (
      <Paper withBorder p="md" radius="sm" component={Link} to={to} className="time-tracker__card" data-link>
        {content}
      </Paper>
    );
}
