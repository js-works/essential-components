import { Group, NativeSelect, NumberInput, Stack, Switch, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import type { Employee, Team } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';

export { EmployeeForm, employeeSchema };

// An employee's data: the name and a valid email are required, the email unique (the server says so); the hours of a
// week (1 to 60) and the vacation days of a year (0 to 40); since when.
const employeeSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  title: z.string().trim().default(''),
  teamId: z.string().min(1),
  weeklyHours: z.number().min(1).max(60),
  vacationDays: z.number().min(0).max(40),
  startDate: z.string().min(1),
  active: z.boolean().default(true),
});

function EmployeeForm({ employee, teams, save }: {
  employee?: Employee;
  teams: readonly Team[];
  save: (values: z.output<typeof employeeSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(employeeSchema, {
    labels: 'employeeForm',
    initial: employee ?? { teamId: teams[0]?.id, weeklyHours: 40, vacationDays: 30, active: true },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput autoComplete="off" data-autofocus {...field.name()} />
        <TextInput autoComplete="off" type="email" {...field.email()} />
        <TextInput autoComplete="off" {...field.title()} />
        <NativeSelect data={teams.map((team) => ({ value: team.id, label: team.name }))} {...field.teamId()} />
        <Group grow align="flex-start">
          <NumberInput allowDecimal={false} suffix={` ${t('employees.hoursUnit')}`} {...field.weeklyHours()} />
          <NumberInput allowDecimal={false} suffix={` ${t('employees.daysUnit')}`} {...field.vacationDays()} />
        </Group>
        <DatePickerInput valueFormat="ll" popoverProps={{ floatingStrategy: 'fixed' }} {...field.startDate()} />
        <Switch {...field.active()} />
      </Stack>
    </DialogForm>
  );
}
