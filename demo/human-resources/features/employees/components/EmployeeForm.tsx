import { Divider, Group, NumberInput, SimpleGrid, Stack, Switch, Text, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { EMPLOYMENT_TYPES, todayDate } from '../../../domain';
import type { Employee, HrData } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';
import { FormSelect } from '../../../shared/ui/FormSelect';
import { departmentOptions, managerOptions } from '../../hr';

export { EmployeeForm, employeeSchema, newEmployeeSchema };

// An employee: the first and the last name and a valid email are required, the email unique (the server says so); the
// birth date; notes; the job (title, department, manager or none, place, contract, hours of a week: 1 to 60); the
// first day.
// A new one also has their first salary (a year's gross), and whether their onboarding checklist starts (ignored when
// edited).
const employeeSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.email(),
  phone: z.string().trim().default(''),
  birthDate: z.string().min(1),
  title: z.string().trim().min(1),
  departmentId: z.string().min(1),
  managerId: z.string().optional().transform((value) => value ?? null),
  location: z.string().trim().default(''),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  weeklyHours: z.number().min(1).max(60),
  startDate: z.string().min(1),
  salary: z.number().optional(),
  notes: z.string().trim().default(''),
  onboarding: z.boolean().default(false),
});

// The same fields; the salary required (the schemas have one type, so one form serves both).
const newEmployeeSchema = employeeSchema.refine((values) => (values.salary ?? 0) > 0, {
  path: ['salary'],
  message: 'errors.salaryRequired',
});

function EmployeeForm({ data, employee, save }: {
  data: HrData;
  employee?: Employee;
  save: (values: z.output<typeof employeeSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  // A new employee also gets their salary (an edit has no such field).
  const { DialogForm, field } = useForm(employee === undefined ? newEmployeeSchema : employeeSchema, {
    labels: 'employeeForm',
    initial: employee === undefined
      ? {
        departmentId: data.departments[0]?.id,
        employmentType: 'fullTime',
        weeklyHours: 40,
        location: 'Stuttgart',
        startDate: today,
        onboarding: true,
      }
      : { ...employee, managerId: employee.managerId ?? undefined },
    submit: save,
  });
  const datePicker = { valueFormat: 'll', popoverProps: { floatingStrategy: 'fixed' as const } };

  return (
    <DialogForm>
      {/* Two columns (2026-10-10, the user's wish): the person on the left, the job on the right; one when narrow. */}
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        <Stack gap="sm">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{t('employees.person')}</Text>
          <SimpleGrid cols={2} spacing="sm">
            <TextInput autoComplete="off" data-autofocus {...field.firstName()} />
            <TextInput autoComplete="off" {...field.lastName()} />
          </SimpleGrid>
          <TextInput autoComplete="off" type="email" {...field.email()} />
          <SimpleGrid cols={2} spacing="sm">
            <TextInput autoComplete="off" type="tel" {...field.phone()} />
            <DatePickerInput {...datePicker} {...field.birthDate()} />
          </SimpleGrid>
          {/* Free notes (2026-10-10, the user's wish): growing with their text, 3 to 6 rows. */}
          <Textarea autosize minRows={3} maxRows={6} {...field.notes()} />
        </Stack>
        <Stack gap="sm">
          <Text size="xs" c="dimmed" tt="uppercase" fw={600}>{t('employees.job')}</Text>
          <TextInput autoComplete="off" {...field.title()} />
          <SimpleGrid cols={2} spacing="sm">
            <FormSelect data={departmentOptions(data)} {...field.departmentId()} />
            <FormSelect
              data={managerOptions(data, today, employee?.id)}
              clearable
              placeholder={t('common.none')}
              {...field.managerId()}
            />
          </SimpleGrid>
          <SimpleGrid cols={2} spacing="sm">
            <FormSelect
              data={EMPLOYMENT_TYPES.map((value) => ({ value, label: t(`employmentType.${value}`) }))}
              {...field.employmentType()}
            />
            <NumberInput allowDecimal={false} suffix={` ${t('common.hoursUnit')}`} {...field.weeklyHours()} />
          </SimpleGrid>
          <Group grow align="flex-start">
            <TextInput autoComplete="off" {...field.location()} />
            <DatePickerInput {...datePicker} {...field.startDate()} />
          </Group>
          {employee === undefined && (
            <NumberInput
              allowDecimal={false}
              thousandSeparator
              min={0}
              step={1000}
              prefix="€ "
              description={t('employees.salaryHint')}
              withAsterisk
              {...field.salary()}
            />
          )}
        </Stack>
      </SimpleGrid>
      {
        /* A new employee: whether their onboarding checklist starts with them (on by default; like the hire's), below
        both columns. */
      }
      {employee === undefined && (
        <>
          <Divider my="md" />
          <Switch {...field.onboarding()} />
        </>
      )}
    </DialogForm>
  );
}
