import { Badge, Button, Grid, Group, Loader, Paper, SimpleGrid, Stack, Tabs, Text, Title } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement, ReactNode } from 'react';
import { useParams } from 'react-router';
import { todayDate, todayStatus, vacationBalance, weekStart } from '../../../domain';
import type { Employee, TimeData } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { useNow } from '../../../shared/lib/useNow';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeAvatar, LeadOnly, PageHeader, TodayBadge } from '../../../shared/ui/parts';
import { AbsenceLegend, MonthCalendar } from '../../calendar';
import { BalanceCards, LeaveTable } from '../../leave';
import { SickTable } from '../../sick';
import { WeekNavigator, WeekSheet, weekSheets } from '../../timesheet';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { useEmployeeFlows } from '../flows';

export { EmployeePage };

// An employee: their data, vacation and months (Overview), a week (Timesheet), their leave requests and sick calls.
// The viewer's own page (from the user menu) for everyone; another's only for a team lead.
function EmployeePage(): ReactElement {
  const t = useTranslate();
  const { employeeId } = useParams();
  const data = useTimeData();
  const viewer = useViewer();
  const flows = useEmployeeFlows();
  const [tab, setTab] = useState<string | null>('overview');

  if (!viewer.isLead && employeeId !== viewer.employeeId) {
    return <LeadOnly />;
  }

  const employee = data?.employees.find((candidate) => candidate.id === employeeId);

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  if (employee === undefined) {
    return <Text c="dimmed">{t('employees.notFound')}</Text>;
  }

  const team = data.teams.find((candidate) => candidate.id === employee.teamId);

  return (
    <Stack gap="md">
      <PageHeader
        title={
          <Group gap="sm" wrap="nowrap">
            <EmployeeAvatar name={employee.name} size={36} />
            <span>{employee.name}</span>
          </Group>
        }
        subtitle={[employee.title, team?.name].filter(Boolean).join(' · ')}
        badges={
          <>
            <TodayBadge status={todayStatus(employee, data, todayDate())} />
            {!employee.active && <Badge variant="light" color="gray">{t('employees.inactive')}</Badge>}
          </>
        }
        actions={viewer.isLead && (
          <Button
            variant="default"
            size="xs"
            leftSection={appIcons.edit}
            onClick={() => void flows.edit(employee, data.teams)}
          >
            {t('common.edit')}
          </Button>
        )}
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List className="time-tracker__tabs" mb="md">
          <Tabs.Tab value="overview">{t('employees.tabOverview')}</Tabs.Tab>
          <Tabs.Tab value="timesheet" leftSection={appIcons.timesheet}>{t('nav.timesheet')}</Tabs.Tab>
          <Tabs.Tab value="leave" leftSection={appIcons.leave}>{t('nav.leave')}</Tabs.Tab>
          <Tabs.Tab value="sick" leftSection={appIcons.sick}>{t('nav.sick')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <EmployeeOverview data={data} employee={employee} />
        </Tabs.Panel>
        <Tabs.Panel value="timesheet">
          <EmployeeWeek data={data} employee={employee} />
        </Tabs.Panel>
        <Tabs.Panel value="leave">
          <LeaveTable
            data={data}
            employees={[employee]}
            mine={employee.id === viewer.employeeId}
            title={t('employees.leaveOf', { name: employee.name })}
          />
        </Tabs.Panel>
        <Tabs.Panel value="sick">
          <SickTable
            employees={[employee]}
            mine={employee.id === viewer.employeeId}
            title={t('employees.sickOf', { name: employee.name })}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }): ReactElement {
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">{label}</Text>
      <Text size="sm">{children}</Text>
    </Stack>
  );
}

// The details, this year's vacation, and two months of absences.
function EmployeeOverview({ data, employee }: { data: TimeData; employee: Employee }): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const year = Number(today.slice(0, 4));

  return (
    <Stack gap="md">
      <BalanceCards balance={vacationBalance(employee, data.leave, year, today, data.holidays)} year={year} />
      <Grid gap="md">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="md" radius="sm" h="100%">
            <Title order={3} size="h5" mb="sm">{t('employees.details')}</Title>
            <SimpleGrid cols={1} spacing="sm">
              <Detail label={t('employeeForm.email')}>{employee.email}</Detail>
              <Detail label={t('employeeForm.weeklyHours')}>
                {`${employee.weeklyHours} ${t('employees.hoursUnit')}`}
              </Detail>
              <Detail label={t('employeeForm.vacationDays')}>
                {`${employee.vacationDays} ${t('employees.daysUnit')}`}
              </Detail>
              <Detail label={t('employeeForm.startDate')}>{formatDate(employee.startDate)}</Detail>
            </SimpleGrid>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md" radius="sm" h="100%">
            <Title order={3} size="h5" mb="sm">{t('employees.absences')}</Title>
            <Stack gap="sm">
              <MonthCalendar data={data} employeeId={employee.id} months={2} />
              <AbsenceLegend />
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

// A week of the employee, with its navigation.
function EmployeeWeek({ data, employee }: { data: TimeData; employee: Employee }): ReactElement {
  const now = useNow(30_000);
  const [monday, setMonday] = useState(() => weekStart(now.date));

  return (
    <Stack gap="md">
      <WeekNavigator monday={monday} today={now.date} onChange={setMonday} />
      <Paper withBorder radius="sm" p="xs">
        <WeekSheet sheets={weekSheets(employee, monday, data, now.date, now.time)} today={now.date} />
      </Paper>
    </Stack>
  );
}
