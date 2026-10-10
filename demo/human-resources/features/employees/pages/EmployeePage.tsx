import { Anchor, Button, Grid, Group, Loader, Menu, Paper, SimpleGrid, Stack, Tabs, Text, Title } from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { Link, useParams } from 'react-router';
import { progressOf, reportsOf, statusOf, todayDate, yearsBetween } from '../../../domain';
import type { Employee, HrData } from '../../../domain';
import { formatDate } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import {
  Detail,
  EmployeeAvatar,
  EmployeeLabel,
  EmployeeStatusBadge,
  PageHeader,
  ProgressCell,
} from '../../../shared/ui/parts';
import { useChecklistFlows } from '../../checklists';
import { departmentName, employeeOf, useHrData } from '../../hr';
import { DocumentsTable } from '../components/DocumentsTable';
import { SalaryTable } from '../components/SalaryTable';
import { useEmployeeFlows } from '../flows';

export { EmployeePage };

// An employee: their person, job and team, their checklists (Overview), their salary (Compensation), their documents.
function EmployeePage(): ReactElement {
  const t = useTranslate();
  const { employeeId } = useParams();
  const data = useHrData();
  const flows = useEmployeeFlows();
  const checklistFlows = useChecklistFlows();
  const [tab, setTab] = useState<string | null>('overview');

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  const employee = data.employees.find((candidate) => candidate.id === employeeId);

  if (employee === undefined) {
    return <Text c="dimmed">{t('employees.notFound')}</Text>;
  }

  const status = statusOf(employee, todayDate());
  const has = (kind: 'onboarding' | 'offboarding') =>
    data.checklists.some((checklist) => checklist.employeeId === employee.id && checklist.kind === kind);

  return (
    <Stack gap="md">
      <PageHeader
        title={
          <Group gap="sm" wrap="nowrap">
            <EmployeeAvatar name={employee.name} size={36} />
            <span>{employee.name}</span>
          </Group>
        }
        subtitle={[employee.title, departmentName(data, employee.departmentId)].filter(Boolean).join(' · ')}
        badges={<EmployeeStatusBadge status={status} />}
        actions={
          <>
            <Button
              variant="default"
              size="xs"
              leftSection={appIcons.edit}
              onClick={() => void flows.edit(employee, data)}
            >
              {t('common.edit')}
            </Button>
            <Menu position="bottom-end" shadow="md" width={240}>
              <Menu.Target>
                <Button variant="default" size="xs" rightSection={appIcons.chevronDown}>{t('common.more')}</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={appIcons.raise} onClick={() => void flows.changeSalary(employee, data)}>
                  {t('salary.new')}
                </Menu.Item>
                <Menu.Item leftSection={appIcons.upload} onClick={() => void flows.uploadDocuments(employee)}>
                  {t('documents.upload')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  leftSection={appIcons.onboarding}
                  disabled={has('onboarding')}
                  onClick={() => void checklistFlows.start(employee, 'onboarding')}
                >
                  {t('checklists.startOnboarding')}
                </Menu.Item>
                <Menu.Item
                  leftSection={appIcons.offboarding}
                  disabled={has('offboarding') || employee.endDate === null}
                  onClick={() => void checklistFlows.start(employee, 'offboarding')}
                >
                  {t('checklists.startOffboarding')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="danger"
                  leftSection={appIcons.offboarding}
                  disabled={status === 'former'}
                  onClick={() => void flows.end(employee, data)}
                >
                  {employee.endDate === null ? t('employees.end') : t('employees.changeEnd')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </>
        }
      />
      <Tabs value={tab} onChange={setTab} keepMounted={false}>
        <Tabs.List className="human-resources__tabs" mb="md">
          <Tabs.Tab value="overview">{t('employees.tabOverview')}</Tabs.Tab>
          <Tabs.Tab value="compensation" leftSection={appIcons.salary}>{t('employees.tabCompensation')}</Tabs.Tab>
          <Tabs.Tab value="documents" leftSection={appIcons.documents}>{t('employees.tabDocuments')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="overview">
          <EmployeeOverview data={data} employee={employee} />
        </Tabs.Panel>
        <Tabs.Panel value="compensation">
          <SalaryTable data={data} employee={employee} />
        </Tabs.Panel>
        <Tabs.Panel value="documents">
          <DocumentsTable employee={employee} />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

// The person, the job, the team (manager and direct reports), the checklists.
function EmployeeOverview({ data, employee }: { data: HrData; employee: Employee }): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const manager = employeeOf(data, employee.managerId);
  const reports = reportsOf(data.employees, employee.id, today).sort((a, b) => a.name.localeCompare(b.name));
  const checklists = data.checklists.filter((checklist) => checklist.employeeId === employee.id);
  const years = employee.startDate <= today ? yearsBetween(employee.startDate, today) : null;

  return (
    <Grid gap="md">
      <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
        <Paper withBorder p="md" radius="sm" h="100%">
          <Title order={3} size="h5" mb="sm">{t('employees.person')}</Title>
          {/* The email on a line of its own: it is long. */}
          <Stack mb="sm">
            <Detail label={t('employeeForm.email')}>
              <Anchor href={`mailto:${employee.email}`} size="sm" truncate display="block">{employee.email}</Anchor>
            </Detail>
          </Stack>
          <SimpleGrid cols={2} spacing="sm">
            <Detail label={t('employeeForm.phone')}>{employee.phone}</Detail>
            <Detail label={t('employeeForm.birthDate')}>
              {employee.birthDate === ''
                ? ''
                : `${formatDate(employee.birthDate)} (${
                  t('employees.age', { count: yearsBetween(employee.birthDate, today) })
                })`}
            </Detail>
            <Detail label={t('employeeForm.location')}>{employee.location}</Detail>
          </SimpleGrid>
          {/* The notes, only when there are some; their line breaks kept. */}
          {employee.notes !== '' && (
            <Stack mt="sm">
              <Detail label={t('employeeForm.notes')}>
                <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{employee.notes}</Text>
              </Detail>
            </Stack>
          )}
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
        <Paper withBorder p="md" radius="sm" h="100%">
          <Title order={3} size="h5" mb="sm">{t('employees.job')}</Title>
          <SimpleGrid cols={2} spacing="sm">
            <Detail label={t('employeeForm.title')}>{employee.title}</Detail>
            <Detail label={t('employeeForm.departmentId')}>
              <Anchor component={Link} to="/departments" size="sm">
                {departmentName(data, employee.departmentId)}
              </Anchor>
            </Detail>
            <Detail label={t('employeeForm.employmentType')}>
              {`${t(`employmentType.${employee.employmentType}`)}, ${employee.weeklyHours} ${t('common.hoursUnit')}`}
            </Detail>
            <Detail label={t('employeeForm.startDate')}>
              {formatDate(employee.startDate)}
              {years !== null && <Text span size="xs" c="dimmed">{` · ${t('employees.years', { count: years })}`}
              </Text>}
            </Detail>
            {employee.endDate !== null && <Detail label={t('employees.endDate')}>{formatDate(employee.endDate)}
            </Detail>}
          </SimpleGrid>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, xl: 4 }}>
        <Paper withBorder p="md" radius="sm" h="100%">
          <Title order={3} size="h5" mb="sm">{t('employees.team')}</Title>
          <Stack gap="sm">
            <Detail label={t('employeeForm.managerId')}>
              {manager === undefined ? '' : <EmployeeLabel employee={manager} title />}
            </Detail>
            <Detail label={t('employees.reports', { count: reports.length })}>
              {reports.length === 0
                ? ''
                : (
                  <Stack gap={6} mt={4}>
                    {reports.slice(0, 8).map((report) => <EmployeeLabel key={report.id} employee={report} />)}
                    {reports.length > 8 && (
                      <Text size="xs" c="dimmed">{t('employees.moreReports', { count: reports.length - 8 })}</Text>
                    )}
                  </Stack>
                )}
            </Detail>
          </Stack>
        </Paper>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6, xl: 12 }}>
        <Paper withBorder p="md" radius="sm" h="100%">
          <Title order={3} size="h5" mb="sm">{t('nav.checklists')}</Title>
          {checklists.length === 0
            ? <Text size="sm" c="dimmed">{t('employees.noChecklists')}</Text>
            : (
              <Stack gap="xs">
                {checklists.map((checklist) => {
                  const progress = progressOf(checklist);

                  return (
                    <Group key={checklist.id} gap="md" wrap="nowrap">
                      <Anchor component={Link} to={`/onboarding/${checklist.id}`} size="sm" w={140}>
                        {t(`checklistKind.${checklist.kind}`)}
                      </Anchor>
                      <ProgressCell done={progress.done} total={progress.total} />
                    </Group>
                  );
                })}
              </Stack>
            )}
        </Paper>
      </Grid.Col>
    </Grid>
  );
}
