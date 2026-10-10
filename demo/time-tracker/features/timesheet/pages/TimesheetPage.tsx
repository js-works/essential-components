import {
  ActionIcon,
  Button,
  Group,
  Loader,
  NativeSelect,
  Paper,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { addDays, membersOf, weekStart } from '../../../domain';
import type { Employee, TimeData } from '../../../domain';
import { formatDate, formatDateRange, formatStamp, formatTime } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { useNow } from '../../../shared/lib/useNow';
import { appIcons } from '../../../shared/ui/icons';
import { PageHeader, RequestStatusBadge } from '../../../shared/ui/parts';
import { useTimeData } from '../../tracker';
import { useViewer } from '../../viewer';
import { WeekSheet, weekSheets } from '../components/WeekSheet';
import { useCorrectionFlows } from '../flows';

export { TimesheetPage, WeekNavigator };

// The timesheet: a week of the viewer (a team lead may choose a member of their team), day by day, with the
// corrections of the week. On the viewer's own past days a correction can be requested.
function TimesheetPage(): ReactElement {
  const t = useTranslate();
  const data = useTimeData();
  const viewer = useViewer();
  const now = useNow(30_000);
  const [monday, setMonday] = useState(() => weekStart(now.date));
  const [chosenId, setChosenId] = useState(viewer.employeeId);
  const flows = useCorrectionFlows();

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  const self = data.employees.find((employee) => employee.id === viewer.employeeId);
  const team = self === undefined ? [] : membersOf(data.employees, self.teamId).filter((member) => member.active);
  const employeeId = viewer.isLead ? chosenId : viewer.employeeId;
  const employee = data.employees.find((candidate) => candidate.id === employeeId) ?? self;

  if (employee === undefined) {
    return <Loader size="sm" />;
  }

  const own = employee.id === viewer.employeeId;

  return (
    <Stack gap="md">
      <PageHeader
        title={t('sheet.title')}
        subtitle={own ? t('sheet.subtitleOwn') : t('sheet.subtitleOf', { name: employee.name })}
        actions={viewer.isLead && (
          <NativeSelect
            aria-label={t('sheet.employee')}
            data={team.map((member) => ({ value: member.id, label: member.name }))}
            value={employee.id}
            onChange={(event) => setChosenId(event.currentTarget.value)}
          />
        )}
      />
      <WeekNavigator monday={monday} today={now.date} onChange={setMonday} />
      <Paper withBorder radius="sm" p="xs">
        <WeekSheet
          sheets={weekSheets(employee, monday, data, now.date, now.time)}
          today={now.date}
          onCorrect={own ? (date) => void flows.request(employee, date) : undefined}
        />
      </Paper>
      <WeekCorrections data={data} employee={employee} monday={monday} />
    </Stack>
  );
}

// The week shown, its range, and the steps to the week before, the next and this one.
function WeekNavigator({ monday, today, onChange }: {
  monday: string;
  today: string;
  onChange: (monday: string) => void;
}): ReactElement {
  const t = useTranslate();

  return (
    <Group gap="xs">
      <Tooltip label={t('sheet.previousWeek')} fz="xs">
        <ActionIcon
          variant="default"
          aria-label={t('sheet.previousWeek')}
          onClick={() => onChange(addDays(monday, -7))}
        >
          {appIcons.previous}
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t('sheet.nextWeek')} fz="xs">
        <ActionIcon variant="default" aria-label={t('sheet.nextWeek')} onClick={() => onChange(addDays(monday, 7))}>
          {appIcons.next}
        </ActionIcon>
      </Tooltip>
      <Button
        variant="default"
        size="xs"
        disabled={monday === weekStart(today)}
        onClick={() => onChange(weekStart(today))}
      >
        {t('sheet.thisWeek')}
      </Button>
      <Text fw={500}>{formatDateRange(monday, addDays(monday, 6))}</Text>
    </Group>
  );
}

// The corrections of the employee for days of the week: when, what, the state and the lead's comment.
function WeekCorrections({ data, employee, monday }: {
  data: TimeData;
  employee: Employee;
  monday: string;
}): ReactElement | null {
  const t = useTranslate();
  const sunday = addDays(monday, 6);
  const corrections = data.corrections.filter((correction) =>
    correction.employeeId === employee.id && correction.date >= monday && correction.date <= sunday
  );

  if (corrections.length === 0) {
    return null;
  }

  return (
    <Paper withBorder radius="sm" p="md">
      <Title order={3} size="h5" mb="xs">{t('correction.ofWeek')}</Title>
      <Table verticalSpacing={6}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('correction.day')}</Table.Th>
            <Table.Th>{t('correction.time')}</Table.Th>
            <Table.Th>{t('correction.reason')}</Table.Th>
            <Table.Th>{t('correction.requested')}</Table.Th>
            <Table.Th>{t('correction.status')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {corrections.map((correction) => (
            <Table.Tr key={correction.id}>
              <Table.Td>{formatDate(correction.date)}</Table.Td>
              <Table.Td className="time-tracker__figures">
                {`${formatTime(correction.start)} – ${formatTime(correction.end)}`}
              </Table.Td>
              <Table.Td>{correction.reason}</Table.Td>
              <Table.Td>{formatStamp(correction.created)}</Table.Td>
              <Table.Td>
                <Stack gap={2}>
                  <RequestStatusBadge status={correction.status} />
                  {correction.comment !== '' && <Text size="xs" c="dimmed">{correction.comment}</Text>}
                </Stack>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
