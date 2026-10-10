import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Checkbox,
  Group,
  Loader,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import type { ReactElement } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { checklistAnchor, daysBetween, isOverdue, progressOf, TASK_OWNERS, todayDate } from '../../../domain';
import type { Checklist, ChecklistTask, HrData, TaskOwner } from '../../../domain';
import { formatDate, formatRelativeDays } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { appIcons } from '../../../shared/ui/icons';
import { EmployeeAvatar, PageHeader } from '../../../shared/ui/parts';
import { departmentName, employeeOf, useHrData } from '../../hr';
import { useChecklistFlows } from '../flows';
import { taskTitle } from '../taskTitle';

export { ChecklistPage };

// A checklist: whose and how far, then its tasks by who does them (HR, IT, the manager, the employee), each ticked off
// with a click, in the order they are due; an overdue one says so. Tasks can be added and removed.
function ChecklistPage(): ReactElement {
  const t = useTranslate();
  const { checklistId } = useParams();
  const data = useHrData();
  const flows = useChecklistFlows();
  const navigate = useNavigate();

  if (data === undefined) {
    return <Loader size="sm" />;
  }

  const checklist = data.checklists.find((candidate) => candidate.id === checklistId);
  const employee = checklist === undefined ? undefined : employeeOf(data, checklist.employeeId);

  if (checklist === undefined || employee === undefined) {
    return <Text c="dimmed">{t('checklists.notFound')}</Text>;
  }

  const progress = progressOf(checklist);
  const anchor = checklistAnchor(checklist.kind, employee);
  const today = todayDate();
  const overdue = checklist.tasks.filter((task) => isOverdue(task, today)).length;

  return (
    <Stack gap="md">
      <PageHeader
        title={
          <Group gap="sm" wrap="nowrap">
            <EmployeeAvatar name={employee.name} size={36} />
            <span>{employee.name}</span>
          </Group>
        }
        badges={
          <Badge variant={checklist.kind === 'onboarding' ? 'light' : 'outline'} leftSection={appIcons[checklist.kind]}>
            {t(`checklistKind.${checklist.kind}`)}
          </Badge>
        }
        subtitle={[employee.title, departmentName(data, employee.departmentId)].filter(Boolean).join(' · ')}
        actions={
          <>
            <Button variant="default" size="xs" component={Link} to={`/employees/${employee.id}`}>
              {t('checklists.openEmployee')}
            </Button>
            <Button size="xs" leftSection={appIcons.add} onClick={() => void flows.addTask(checklist)}>
              {t('checklists.addTask')}
            </Button>
            <Tooltip label={t('checklists.deleteTitle')} openDelay={400} fz="xs">
              <ActionIcon
                variant="default"
                size={30}
                aria-label={t('checklists.deleteTitle')}
                onClick={async () => {
                  if (await flows.remove([checklist], data)) {
                    void navigate('/onboarding');
                  }
                }}
              >
                {appIcons.remove}
              </ActionIcon>
            </Tooltip>
          </>
        }
      />
      <Paper withBorder p="md" radius="sm">
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              {t(checklist.kind === 'onboarding' ? 'checklists.firstDay' : 'checklists.lastDay')}
            </Text>
            <Text fw={600}>
              {anchor === null ? '–' : `${formatDate(anchor)} · ${formatRelativeDays(daysBetween(today, anchor))}`}
            </Text>
          </Stack>
          <Stack gap={2} align="flex-end">
            <Text size="sm" className="human-resources__figures">
              {t('checklists.doneOf', { done: progress.done, total: progress.total })}
            </Text>
            {overdue > 0 && (
              <Text size="xs" c="var(--mantine-color-error)">{t('checklists.overdue', { count: overdue })}</Text>
            )}
          </Stack>
        </Group>
        <Progress mt="sm" value={progress.total === 0 ? 0 : (progress.done / progress.total) * 100} size="md" />
      </Paper>
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
        {TASK_OWNERS.map((owner) => (
          <OwnerTasks key={owner} data={data} checklist={checklist} owner={owner} today={today} />
        ))}
      </SimpleGrid>
    </Stack>
  );
}

// The tasks of one owner, by due date.
function OwnerTasks({ data, checklist, owner, today }: {
  data: HrData;
  checklist: Checklist;
  owner: TaskOwner;
  today: string;
}): ReactElement {
  const t = useTranslate();
  const flows = useChecklistFlows();
  const tasks = checklist.tasks.filter((task) => task.owner === owner).sort((a, b) => a.due.localeCompare(b.due));
  const done = tasks.filter((task) => task.done).length;
  const employee = employeeOf(data, checklist.employeeId);
  const manager = employee === undefined ? undefined : employeeOf(data, employee.managerId);

  return (
    <Paper withBorder p="md" radius="sm">
      <Group justify="space-between" mb="sm" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <Title order={3} size="h5">{t(`taskOwner.${owner}`)}</Title>
          {owner === 'manager' && manager !== undefined && (
            <Anchor component={Link} to={`/employees/${manager.id}`} size="xs">{manager.name}</Anchor>
          )}
        </Group>
        <Text size="xs" c="dimmed" className="human-resources__figures">{`${done} / ${tasks.length}`}</Text>
      </Group>
      {tasks.length === 0
        ? <Text size="sm" c="dimmed">{t('checklists.noTasks')}</Text>
        : (
          <Stack gap={6}>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                today={today}
                onToggle={(value) => void flows.setDone(checklist, [task], value)}
                onRemove={() => void flows.removeTask(checklist, task, taskTitle(t, task))}
              />
            ))}
          </Stack>
        )}
    </Paper>
  );
}

function TaskRow({ task, today, onToggle, onRemove }: {
  task: ChecklistTask;
  today: string;
  onToggle: (done: boolean) => void;
  onRemove: () => void;
}): ReactElement {
  const t = useTranslate();
  const overdue = isOverdue(task, today);

  return (
    <Group gap="xs" wrap="nowrap" className="human-resources__task" data-done={task.done || undefined}>
      <Checkbox
        checked={task.done}
        onChange={(event) => onToggle(event.currentTarget.checked)}
        label={taskTitle(t, task)}
        flex={1}
      />
      <Text
        size="xs"
        c={overdue ? 'var(--mantine-color-error)' : 'dimmed'}
        className="human-resources__figures"
        style={{ flex: 'none' }}
      >
        {overdue ? t('checklists.overdueSince', { date: formatDate(task.due) }) : formatDate(task.due)}
      </Text>
      <Tooltip label={t('checklists.removeTaskTitle')} openDelay={400} fz="xs">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          className="human-resources__task-remove"
          aria-label={t('checklists.removeTaskTitle')}
          onClick={onRemove}
        >
          {appIcons.reject}
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
