import { NumberInput, SimpleGrid, Stack, Switch, Text, Textarea, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { addDays, CANDIDATE_SOURCES, EMPLOYMENT_TYPES, OPENING_STATUSES, todayDate } from '../../../domain';
import type { Candidate, HrData, Opening } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';
import { FormSelect } from '../../../shared/ui/FormSelect';
import { departmentOptions, managerOptions } from '../../hr';

export { CandidateForm, candidateSchema, HireForm, hireSchema, OpeningForm, openingSchema };

// A select without a value (none chosen) is `null`.
const noneToNull = (value: string | undefined) => value ?? null;

// An opening: the title and the department required; the hiring manager (or none), the place, the contract, how many
// positions (1 to 20), its status, a description.
const openingSchema = z.object({
  title: z.string().trim().min(1),
  departmentId: z.string().min(1),
  hiringManagerId: z.string().optional().transform(noneToNull),
  location: z.string().trim().default(''),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  positions: z.number().min(1).max(20),
  status: z.enum(OPENING_STATUSES),
  description: z.string().trim().default(''),
});

function OpeningForm({ data, opening, save }: {
  data: HrData;
  opening?: Opening;
  save: (values: z.output<typeof openingSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(openingSchema, {
    labels: 'openingForm',
    initial: opening === undefined
      ? { departmentId: data.departments[0]?.id, employmentType: 'fullTime', positions: 1, status: 'open' }
      : { ...opening, hiringManagerId: opening.hiringManagerId ?? undefined },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput autoComplete="off" data-autofocus {...field.title()} />
        <SimpleGrid cols={2} spacing="sm">
          <FormSelect data={departmentOptions(data)} {...field.departmentId()} />
          <FormSelect
            data={managerOptions(data, todayDate())}
            clearable
            placeholder={t('common.none')}
            {...field.hiringManagerId()}
          />
        </SimpleGrid>
        <SimpleGrid cols={2} spacing="sm">
          <TextInput autoComplete="off" {...field.location()} />
          <FormSelect
            data={EMPLOYMENT_TYPES.map((value) => ({ value, label: t(`employmentType.${value}`) }))}
            {...field.employmentType()}
          />
        </SimpleGrid>
        <SimpleGrid cols={2} spacing="sm">
          <NumberInput allowDecimal={false} min={1} max={20} {...field.positions()} />
          <FormSelect
            data={OPENING_STATUSES.map((value) => ({ value, label: t(`openingStatus.${value}`) }))}
            {...field.status()}
          />
        </SimpleGrid>
        <Textarea autosize minRows={3} maxRows={8} {...field.description()} />
      </Stack>
    </DialogForm>
  );
}

// A candidate: the name and a valid email, where they came from, a rating (0: not rated yet), a note.
const candidateSchema = z.object({
  name: z.string().trim().min(1),
  email: z.email(),
  source: z.enum(CANDIDATE_SOURCES),
  rating: z.coerce.number<string>().min(0).max(5),
  note: z.string().trim().default(''),
});

function CandidateForm({ candidate, save }: {
  candidate?: Candidate;
  save: (values: z.output<typeof candidateSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(candidateSchema, {
    labels: 'candidateForm',
    initial: candidate === undefined
      ? { source: 'website', rating: '0' }
      : { ...candidate, rating: String(candidate.rating) },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <TextInput autoComplete="off" data-autofocus {...field.name()} />
        <TextInput autoComplete="off" type="email" {...field.email()} />
        <SimpleGrid cols={2} spacing="sm">
          <FormSelect
            data={CANDIDATE_SOURCES.map((value) => ({ value, label: t(`source.${value}`) }))}
            {...field.source()}
          />
          <FormSelect
            data={[0, 1, 2, 3, 4, 5].map((value) => ({
              value: String(value),
              label: value === 0 ? t('candidates.notRated') : '★'.repeat(value) + '☆'.repeat(5 - value),
            }))}
            {...field.rating()}
          />
        </SimpleGrid>
        <Textarea autosize minRows={2} maxRows={6} {...field.note()} />
      </Stack>
    </DialogForm>
  );
}

// A hire: the job of the new employee (from the opening, changeable), the first day (today or later), the salary, and
// whether the onboarding checklist starts.
const hireSchema = z.object({
  title: z.string().trim().min(1),
  departmentId: z.string().min(1),
  managerId: z.string().optional().transform(noneToNull),
  location: z.string().trim().default(''),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  weeklyHours: z.number().min(1).max(60),
  startDate: z.string().min(1),
  salary: z.number().min(1),
  onboarding: z.boolean().default(true),
});

function HireForm({ data, candidate, opening, save }: {
  data: HrData;
  candidate: Candidate;
  opening: Opening;
  save: (values: z.output<typeof hireSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const today = todayDate();
  const { DialogForm, field } = useForm(hireSchema, {
    labels: 'hireForm',
    initial: {
      title: opening.title,
      departmentId: opening.departmentId,
      managerId: opening.hiringManagerId ?? undefined,
      location: opening.location,
      employmentType: opening.employmentType,
      weeklyHours: opening.employmentType === 'partTime' ? 30 : 40,
      // The first of the month after next: a usual notice period.
      startDate: `${addDays(today, 45).slice(0, 7)}-01`,
      onboarding: true,
    },
    submit: save,
  });
  const datePicker = { valueFormat: 'll', popoverProps: { floatingStrategy: 'fixed' as const } };

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm">{t('hire.explain', { name: candidate.name })}</Text>
        <TextInput autoComplete="off" {...field.title()} />
        <SimpleGrid cols={2} spacing="sm">
          <FormSelect data={departmentOptions(data)} {...field.departmentId()} />
          <FormSelect
            data={managerOptions(data, today)}
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
        <SimpleGrid cols={2} spacing="sm">
          <TextInput autoComplete="off" {...field.location()} />
          <DatePickerInput {...datePicker} minDate={today} {...field.startDate()} />
        </SimpleGrid>
        <NumberInput
          allowDecimal={false}
          thousandSeparator
          min={0}
          step={1000}
          prefix="€ "
          data-autofocus
          {...field.salary()}
        />
        <Switch {...field.onboarding()} />
      </Stack>
    </DialogForm>
  );
}
