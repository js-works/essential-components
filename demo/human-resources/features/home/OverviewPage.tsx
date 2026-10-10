import { Anchor, Grid, Group, Loader, Paper, Progress, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import {
  childrenOf,
  daysBetween,
  isInProcess,
  isOverdue,
  PIPELINE,
  progressOf,
  statusOf,
  todayDate,
  upcomingEvents,
} from '../../domain';
import type { HrData, UpcomingEvent } from '../../domain';
import { formatDayMonth, formatRelativeDays } from '../../shared/lib/format';
import { useTranslate } from '../../shared/lib/i18n';
import { appIcons } from '../../shared/ui/icons';
import { EmployeeLabel, PageHeader, StatCard } from '../../shared/ui/parts';
import { taskTitle } from '../checklists';
import { headcount } from '../departments';
import { employeeOf, useHrData } from '../hr';

export { OverviewPage };

// The days ahead the start page looks at (birthdays, anniversaries, first and last days).
const AHEAD = 30;

// The start page: the numbers (headcount, open positions, candidates, onboarding), the headcount by department, what
// comes in the next weeks, the recruiting pipeline, and the next tasks of the checklists.
function OverviewPage(): ReactElement {
  const t = useTranslate();
  const data = useHrData();

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <Stack gap="md">
      <PageHeader title={t('nav.overview')} subtitle={t('overview.subtitle')} />
      <Numbers data={data} />
      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
          <ByDepartment data={data} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
          <ComingUp data={data} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
          <Pipeline data={data} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, xl: 12 }}>
          <NextTasks data={data} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function Numbers({ data }: { data: HrData }): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const statuses = data.employees.map((employee) => statusOf(employee, today));
  const working = statuses.filter((status) => status === 'active' || status === 'leaving').length;
  const joining = statuses.filter((status) => status === 'upcoming').length;
  const open = data.openings.filter((opening) => opening.status === 'open');
  const toFill = open.reduce(
    (sum, opening) =>
      sum + Math.max(
        0,
        opening.positions
          - data.candidates.filter((candidate) => candidate.openingId === opening.id && candidate.stage === 'hired')
            .length,
      ),
    0,
  );
  const inProcess = data.candidates.filter((candidate) =>
    isInProcess(candidate) && open.some((opening) => opening.id === candidate.openingId)
  );
  const running = data.checklists.filter((checklist) => !progressOf(checklist).complete);
  const overdue = running.flatMap((checklist) => checklist.tasks).filter((task) => isOverdue(task, today)).length;

  return (
    <SimpleGrid cols={{ base: 1, xs: 2, lg: 4 }} spacing="md">
      <StatCard
        label={t('overview.headcount')}
        value={working}
        detail={joining === 0 ? t('overview.noneJoining') : t('overview.joining', { count: joining })}
        to="/employees"
        toLabel={t('nav.employees')}
      />
      <StatCard
        label={t('overview.openPositions')}
        value={toFill}
        detail={t('overview.openings', { count: open.length })}
        to="/recruiting"
        toLabel={t('nav.recruiting')}
      />
      <StatCard
        label={t('overview.candidates')}
        value={inProcess.length}
        detail={t('overview.candidatesDetail', {
          interviews: inProcess.filter((candidate) => candidate.stage === 'interview').length,
          offers: inProcess.filter((candidate) => candidate.stage === 'offer').length,
        })}
        to="/recruiting"
        toLabel={t('nav.recruiting')}
      />
      <StatCard
        label={t('overview.checklists')}
        value={running.length}
        detail={overdue === 0 ? t('overview.nothingOverdue') : t('overview.overdueTasks', { count: overdue })}
        to="/onboarding"
        toLabel={t('nav.checklists')}
      />
    </SimpleGrid>
  );
}

// The headcount of the departments below Management (with their own departments), as bars.
function ByDepartment({ data }: { data: HrData }): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const [top] = childrenOf(data.departments, null);
  const rows = (top === undefined ? [] : childrenOf(data.departments, top.id))
    .map((department) => ({ department, count: headcount(data, department.id, today, true) }))
    .sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Group justify="space-between" mb="sm">
        <Title order={3} size="h5">{t('overview.byDepartment')}</Title>
        <Anchor component={Link} to="/departments" size="sm">{t('overview.openChart')}</Anchor>
      </Group>
      <Stack gap={8}>
        {rows.map(({ department, count }) => (
          <div key={department.id}>
            <Group justify="space-between" gap="xs" wrap="nowrap" mb={2}>
              <Text size="sm" truncate>{department.name}</Text>
              <Text size="sm" c="dimmed" className="human-resources__figures">{count}</Text>
            </Group>
            <Progress value={(count / max) * 100} size="sm" aria-hidden />
          </div>
        ))}
      </Stack>
    </Paper>
  );
}

const EVENT_ICONS: Readonly<Record<UpcomingEvent['kind'], ReactElement>> = {
  birthday: appIcons.birthday,
  anniversary: appIcons.anniversary,
  start: appIcons.onboarding,
  end: appIcons.offboarding,
};

// Birthdays, work anniversaries, first and last days of the next weeks.
function ComingUp({ data }: { data: HrData }): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const events = upcomingEvents(data.employees, today, AHEAD).slice(0, 8);

  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Title order={3} size="h5" mb="sm">{t('overview.comingUp', { days: AHEAD })}</Title>
      {events.length === 0
        ? <Text size="sm" c="dimmed">{t('overview.nothingComing')}</Text>
        : (
          <Stack gap="xs">
            {events.map((event) => (
              <Group key={`${event.kind}:${event.employee.id}`} gap="sm" wrap="nowrap" justify="space-between">
                <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                  <ThemeIcon variant="light" size="md" radius="xl" aria-hidden>{EVENT_ICONS[event.kind]}</ThemeIcon>
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <EmployeeLabel employee={event.employee} />
                    <Text size="xs" c="dimmed" truncate>
                      {event.kind === 'anniversary'
                        ? t('event.anniversary', { count: event.years ?? 0 })
                        : t(`event.${event.kind}`)}
                    </Text>
                  </Stack>
                </Group>
                <Stack gap={0} align="flex-end" style={{ flex: 'none' }}>
                  <Text size="sm">{formatDayMonth(event.date)}</Text>
                  <Text size="xs" c="dimmed">{formatRelativeDays(daysBetween(today, event.date))}</Text>
                </Stack>
              </Group>
            ))}
          </Stack>
        )}
    </Paper>
  );
}

// The candidates of the open openings by stage.
function Pipeline({ data }: { data: HrData }): ReactElement {
  const t = useTranslate();
  const open = new Set(data.openings.filter((opening) => opening.status === 'open').map((opening) => opening.id));
  const candidates = data.candidates.filter((candidate) => open.has(candidate.openingId));
  const counts = PIPELINE.map((stage) => ({
    stage,
    count: candidates.filter((candidate) => candidate.stage === stage).length,
  }));
  const max = Math.max(1, ...counts.map((entry) => entry.count));

  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Group justify="space-between" mb="sm">
        <Title order={3} size="h5">{t('overview.pipeline')}</Title>
        <Anchor component={Link} to="/recruiting" size="sm">{t('overview.allOpenings')}</Anchor>
      </Group>
      <Stack gap={10}>
        {counts.map(({ stage, count }) => (
          <Group key={stage} gap="sm" wrap="nowrap">
            <Text size="sm" w={96} truncate>{t(`stage.${stage}`)}</Text>
            <Progress value={(count / max) * 100} size="lg" flex={1} aria-hidden />
            <Text size="sm" c="dimmed" w={24} ta="right" className="human-resources__figures">{count}</Text>
          </Group>
        ))}
      </Stack>
      <Text size="xs" c="dimmed" mt="md">
        {t('overview.pipelineDetail', { count: open.size })}
      </Text>
    </Paper>
  );
}

// The open tasks of the checklists, the overdue and the next due first.
function NextTasks({ data }: { data: HrData }): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const tasks = data.checklists
    .flatMap((checklist) => checklist.tasks.filter((task) => !task.done).map((task) => ({ checklist, task })))
    .sort((a, b) => a.task.due.localeCompare(b.task.due))
    .slice(0, 6);

  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Group justify="space-between" mb="sm">
        <Title order={3} size="h5">{t('overview.nextTasks')}</Title>
        <Anchor component={Link} to="/onboarding" size="sm">{t('overview.allChecklists')}</Anchor>
      </Group>
      {tasks.length === 0
        ? <Text size="sm" c="dimmed">{t('checklists.allDone')}</Text>
        : (
          <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xs" verticalSpacing="xs">
            {tasks.map(({ checklist, task }) => {
              const employee = employeeOf(data, checklist.employeeId);
              const overdue = isOverdue(task, today);

              return (
                <Group key={task.id} gap="sm" wrap="nowrap" justify="space-between">
                  <Stack gap={0} style={{ minWidth: 0 }}>
                    <Anchor component={Link} to={`/onboarding/${checklist.id}`} size="sm" truncate>
                      {taskTitle(t, task)}
                    </Anchor>
                    <Text size="xs" c="dimmed" truncate>
                      {`${employee?.name ?? ''} · ${t(`checklistKind.${checklist.kind}`)} · ${
                        t(`taskOwner.${task.owner}`)
                      }`}
                    </Text>
                  </Stack>
                  <Text size="xs" c={overdue ? 'var(--mantine-color-error)' : 'dimmed'} style={{ flex: 'none' }}>
                    {formatRelativeDays(daysBetween(today, task.due))}
                  </Text>
                </Group>
              );
            })}
          </SimpleGrid>
        )}
    </Paper>
  );
}
