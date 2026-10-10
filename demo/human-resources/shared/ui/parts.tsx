import { Anchor, Avatar, Badge, Group, Paper, Progress, Stack, Text, Title } from '@mantine/core';
import type { ReactElement, ReactNode } from 'react';
import { Link } from 'react-router';
import type { Employee, EmployeeStatus, OpeningStatus, Stage } from '../../domain';
import { useTranslate } from '../lib/i18n';
import { appIcons } from './icons';

export {
  Detail,
  EmployeeAvatar,
  EmployeeLabel,
  EmployeeStatusBadge,
  OpeningStatusBadge,
  PageHeader,
  ProgressCell,
  Rating,
  StageBadge,
  StatCard,
};

// The parts of the pages: the header, an employee's avatar and name, the pills of states, the cards of the overview.

// The title of a page, its subtitle, and its actions on the right.
function PageHeader({ title, subtitle, badges, actions }: {
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
}): ReactElement {
  return (
    <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm" className="human-resources__page-header">
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
    <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
      <EmployeeAvatar name={employee.name} size={title ? 26 : 22} />
      <Stack gap={0} style={{ minWidth: 0 }}>
        <Anchor component={Link} to={`/employees/${employee.id}`} size="sm" truncate>{employee.name}</Anchor>
        {title && <Text size="xs" c="dimmed" truncate>{employee.title}</Text>}
      </Stack>
    </Group>
  );
}

// A label and its value, stacked.
function Detail({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm" component="div">{children === '' || children === null ? '–' : children}</Text>
    </Stack>
  );
}

// The pills (like the Board Manager's and the Time Tracker's): only in the accent, their variant tells the states apart
// (`filled` the one that matters most, `outline` the coming or open one, `light` the rest), and gray only for what is
// over or out.
type Pill = { variant: 'filled' | 'light' | 'outline'; color?: 'gray' };

const EMPLOYEE_PILLS: Readonly<Record<EmployeeStatus, Pill>> = {
  upcoming: { variant: 'outline' },
  active: { variant: 'light' },
  leaving: { variant: 'filled' },
  former: { variant: 'light', color: 'gray' },
};

function EmployeeStatusBadge({ status }: { status: EmployeeStatus }): ReactElement {
  const t = useTranslate();

  return <Badge {...EMPLOYEE_PILLS[status]}>{t(`employeeStatus.${status}`)}</Badge>;
}

const OPENING_PILLS: Readonly<Record<OpeningStatus, Pill>> = {
  open: { variant: 'filled' },
  onHold: { variant: 'outline' },
  closed: { variant: 'light', color: 'gray' },
};

function OpeningStatusBadge({ status }: { status: OpeningStatus }): ReactElement {
  const t = useTranslate();

  return <Badge {...OPENING_PILLS[status]}>{t(`openingStatus.${status}`)}</Badge>;
}

const STAGE_PILLS: Readonly<Record<Stage, Pill>> = {
  applied: { variant: 'outline' },
  screening: { variant: 'light' },
  interview: { variant: 'light' },
  offer: { variant: 'light' },
  hired: { variant: 'filled' },
  rejected: { variant: 'light', color: 'gray' },
};

function StageBadge({ stage }: { stage: Stage }): ReactElement {
  const t = useTranslate();

  return <Badge {...STAGE_PILLS[stage]}>{t(`stage.${stage}`)}</Badge>;
}

// A rating of 0 to 5 as stars (0: not rated yet, a dash).
function Rating({ value }: { value: number }): ReactElement {
  const t = useTranslate();

  return value === 0
    ? <Text size="xs" c="dimmed">{t('candidates.notRated')}</Text>
    : (
      <span className="human-resources__rating" role="img" aria-label={t('candidates.ratingOf', { value })}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} data-on={star <= value || undefined}>
            {star <= value ? appIcons.starFilled : appIcons.star}
          </span>
        ))}
      </span>
    );
}

// The progress of a checklist: a bar and `5 / 9`.
function ProgressCell({ done, total }: { done: number; total: number }): ReactElement {
  return (
    <Group gap="xs" wrap="nowrap" w="100%">
      <Progress value={total === 0 ? 0 : (done / total) * 100} size="sm" flex={1} miw={40} />
      <Text size="xs" c="dimmed" className="human-resources__figures">{`${done} / ${total}`}</Text>
    </Group>
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
          <Text size="xs" className="human-resources__card-target">
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
    ? <Paper withBorder p="md" radius="sm" className="human-resources__card">{content}</Paper>
    : (
      <Paper withBorder p="md" radius="sm" component={Link} to={to} className="human-resources__card" data-link>
        {content}
      </Paper>
    );
}
