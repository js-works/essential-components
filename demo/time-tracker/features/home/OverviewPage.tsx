import { Anchor, Grid, Group, Loader, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import type { ReactElement } from 'react';
import { Link } from 'react-router';
import { absenceOn, addDays, daySheet, membersOf, vacationBalance, weekStart } from '../../domain';
import type { Employee, TimeData } from '../../domain';
import { formatDateRange, formatDays, formatDuration } from '../../shared/lib/format';
import { useTranslate } from '../../shared/lib/i18n';
import { useNow } from '../../shared/lib/useNow';
import { AbsenceBadge, EmployeeLabel, PageHeader, StatCard } from '../../shared/ui/parts';
import { AbsenceLegend, MonthCalendar } from '../calendar';
import { ClockCard } from '../clock';
import { useTimeData } from '../tracker';
import { useViewer } from '../viewer';

export { OverviewPage };

// The start page: the viewer's clock, their numbers (vacation left, this week, their open requests; a team lead also
// what waits for them), who of the team is off today, the viewer's month and their coming absences.
function OverviewPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const now = useNow(30_000);
  const self = data?.employees.find((employee) => employee.id === viewer.employeeId);

  if (data === undefined || self === undefined) {
    return <Loader size="sm" />;
  }

  return (
    <Stack gap="md">
      <PageHeader title={t('nav.overview')} subtitle={t('overview.subtitle')} />
      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ClockCard data={data} employee={self} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Numbers data={data} self={self} today={now.date} time={now.time} isLead={viewer.isLead} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <OffToday data={data} self={self} today={now.date} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 4 }}>
          <Paper withBorder p="md" radius="sm" h="100%">
            <Title order={3} size="h5" mb="sm">{t('overview.myMonth')}</Title>
            <Stack gap="sm" align="flex-start">
              <MonthCalendar data={data} employeeId={self.id} />
              <AbsenceLegend kinds={['vacation', 'sick', 'holiday']} />
            </Stack>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <ComingUp data={data} self={self} today={now.date} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function Numbers({ data, self, today, time, isLead }: {
  data: TimeData;
  self: Employee;
  today: string;
  time: string;
  isLead: boolean;
}): ReactElement {
  const t = useTranslate();
  const balance = vacationBalance(self, data.leave, Number(today.slice(0, 4)), today, data.holidays);
  const monday = weekStart(today);
  const week = [0, 1, 2, 3, 4]
    .map((offset) => addDays(monday, offset))
    .filter((date) => date <= today)
    .map((date) => daySheet(self, date, data, today, time));
  const weekBalance = week.reduce((sum, sheet) => sum + (sheet.balance ?? 0), 0);
  const ownPending = data.leave.filter((request) => request.employeeId === self.id && request.status === 'pending');
  const team = membersOf(data.employees, self.teamId).filter((member) => member.id !== self.id).map((m) => m.id);
  const waiting = data.leave.filter((request) => team.includes(request.employeeId) && request.status === 'pending')
    .length
    + data.corrections.filter((correction) => team.includes(correction.employeeId) && correction.status === 'pending')
      .length;

  return (
    <SimpleGrid cols={2} spacing="md" h="100%">
      <StatCard
        label={t('overview.vacationLeft')}
        value={formatDays(balance.remaining)}
        detail={t('overview.ofDays', { days: formatDays(balance.allowance) })}
        to="/leave"
        toLabel={t('nav.leave')}
      />
      <StatCard
        label={t('overview.myRequests')}
        value={ownPending.length}
        detail={t('overview.pendingDays', { days: formatDays(balance.pending) })}
        to="/leave"
        toLabel={t('nav.leave')}
      />
      <StatCard
        label={t('overview.thisWeek')}
        value={formatDuration(weekBalance, { sign: true })}
        detail={t('overview.weekWorked', { worked: formatDuration(week.reduce((sum, s) => sum + s.worked, 0)) })}
        to="/timesheet"
        toLabel={t('nav.timesheet')}
      />
      {isLead
        ? (
          <StatCard
            label={t('overview.toApprove')}
            value={waiting}
            detail={t('overview.toApproveDetail')}
            to="/approvals"
            toLabel={t('nav.approvals')}
          />
        )
        : (
          <StatCard
            label={t('overview.sickDays')}
            value={data.sick.filter((note) => note.employeeId === self.id && note.from.startsWith(today.slice(0, 4)))
              .length}
            detail={t('overview.sickDetail')}
            to="/sick"
            toLabel={t('nav.sick')}
          />
        )}
    </SimpleGrid>
  );
}

// Who of the viewer's team is away today (absent the whole day or half of it), with why.
function OffToday({ data, self, today }: { data: TimeData; self: Employee; today: string }): ReactElement {
  const t = useTranslate();
  const away = membersOf(data.employees, self.teamId)
    .filter((member) => member.active)
    .map((member) => ({ member, absence: absenceOn(member.id, today, data) }))
    .filter((entry) => entry.absence !== undefined && !entry.absence.pending);

  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Group justify="space-between" mb="sm">
        <Title order={3} size="h5">{t('overview.offToday')}</Title>
        <Anchor component={Link} to="/calendar" size="sm">{t('overview.openCalendar')}</Anchor>
      </Group>
      {away.length === 0
        ? <Text size="sm" c="dimmed">{t('overview.allIn')}</Text>
        : (
          <Stack gap="xs">
            {away.map(({ member, absence }) => (
              <Group key={member.id} justify="space-between" wrap="nowrap">
                <EmployeeLabel employee={member} />
                {absence !== undefined && <AbsenceBadge absence={absence} />}
              </Group>
            ))}
          </Stack>
        )}
    </Paper>
  );
}

// The viewer's coming leave (approved or pending), the next first.
function ComingUp({ data, self, today }: { data: TimeData; self: Employee; today: string }): ReactElement {
  const t = useTranslate();
  const coming = data.leave
    .filter((request) =>
      request.employeeId === self.id && request.to >= today
      && (request.status === 'approved' || request.status === 'pending')
    )
    .sort((a, b) => a.from.localeCompare(b.from))
    .slice(0, 5);

  return (
    <Paper withBorder p="md" radius="sm" h="100%">
      <Group justify="space-between" mb="sm">
        <Title order={3} size="h5">{t('overview.comingUp')}</Title>
        <Anchor component={Link} to="/leave" size="sm">{t('overview.allRequests')}</Anchor>
      </Group>
      {coming.length === 0
        ? <Text size="sm" c="dimmed">{t('overview.nothingPlanned')}</Text>
        : (
          <Stack gap="xs">
            {coming.map((request) => (
              <Group key={request.id} justify="space-between" wrap="nowrap">
                <Text size="sm">{formatDateRange(request.from, request.to)}</Text>
                <AbsenceBadge
                  absence={{ kind: request.type, halfDay: request.halfDay, pending: request.status === 'pending' }}
                />
              </Group>
            ))}
          </Stack>
        )}
    </Paper>
  );
}
