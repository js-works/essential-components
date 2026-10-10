import { Group, Stack, Text, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { CHECKLIST_KINDS, statusOf, TASK_OWNERS, todayDate } from '../../../domain';
import type { HrData } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';
import { FormSelect } from '../../../shared/ui/FormSelect';

export { ChecklistForm, checklistSchema, TaskForm, taskSchema };

// A new checklist: whose, and which kind; its tasks come from the template (the server refuses a second one of a kind,
// and an offboarding without a last day).
const checklistSchema = z.object({
  employeeId: z.string().min(1),
  kind: z.enum(CHECKLIST_KINDS),
});

function ChecklistForm({ data, save }: {
  data: HrData;
  save: (values: z.output<typeof checklistSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const employees = data.employees
    .filter((employee) => statusOf(employee, today) !== 'former')
    .sort((a, b) => a.name.localeCompare(b.name));
  const { DialogForm, field } = useForm(checklistSchema, {
    labels: 'checklistForm',
    initial: { kind: 'onboarding' },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">{t('checklists.newExplain')}</Text>
        <FormSelect
          data={employees.map((employee) => ({ value: employee.id, label: `${employee.name} (${employee.title})` }))}
          placeholder={t('common.choose')}
          data-autofocus
          {...field.employeeId()}
        />
        <FormSelect
          data={CHECKLIST_KINDS.map((value) => ({ value, label: t(`checklistKind.${value}`) }))}
          {...field.kind()}
        />
      </Stack>
    </DialogForm>
  );
}

// A task added by hand: what, who does it, when it is due.
const taskSchema = z.object({
  title: z.string().trim().min(1),
  owner: z.enum(TASK_OWNERS),
  due: z.string().min(1),
});

function TaskForm({ due, save }: {
  due: string;
  save: (values: z.output<typeof taskSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(taskSchema, {
    labels: 'taskForm',
    initial: { owner: 'hr', due },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput autoComplete="off" data-autofocus {...field.title()} />
        <Group grow align="flex-start">
          <FormSelect
            data={TASK_OWNERS.map((value) => ({ value, label: t(`taskOwner.${value}`) }))}
            {...field.owner()}
          />
          <DatePickerInput valueFormat="ll" popoverProps={{ floatingStrategy: 'fixed' }} {...field.due()} />
        </Group>
      </Stack>
    </DialogForm>
  );
}
