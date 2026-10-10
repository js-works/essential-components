import { Alert, Group, NativeSelect, Stack, Text, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useState } from 'react';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { leaveDays } from '../../../domain';
import type { HalfDay, Holiday, VacationBalance } from '../../../domain';
import { formatDays } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';

export { LeaveForm, leaveSchema };

// A request for leave: the type, the first and the last day, a half day (only for a single day), a note. The schema
// has the order of the days and the half day; the server the working days, the overlaps and the balance.
const leaveSchema = z
  .object({
    type: z.enum(['vacation', 'special', 'unpaid']),
    from: z.string().min(1),
    to: z.string().min(1),
    halfDay: z.enum(['none', 'am', 'pm']).default('none'),
    note: z.string().trim().default(''),
  })
  .refine((values) => values.to >= values.from, { path: ['to'], message: 'errors.endBeforeStart' })
  .refine((values) => values.halfDay === 'none' || values.to === values.from, {
    path: ['halfDay'],
    message: 'errors.halfDayMultiple',
  });

// Below the dates, live: the working days the request takes, and for a vacation what is left of the year's days.
function LeaveForm({ balance, holidays, initial, save }: {
  balance: VacationBalance;
  holidays: readonly Holiday[];
  initial: { from: string; to: string };
  save: (values: z.output<typeof leaveSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  // What the hint needs, followed from the fields' changes (a date picker gives its value, a select its event).
  const [draft, setDraft] = useState({ type: 'vacation', ...initial, halfDay: 'none' });
  const change = (key: keyof typeof draft) => (value: unknown) =>
    setDraft((current) => ({
      ...current,
      [key]: typeof value === 'string'
        ? value
        : typeof value === 'object' && value !== null && 'currentTarget' in value
        ? String((value as { currentTarget: HTMLSelectElement }).currentTarget.value)
        : '',
    }));
  const { DialogForm, field } = useForm(leaveSchema, {
    labels: 'leaveForm',
    initial: { type: 'vacation', ...initial },
    submit: save,
  });
  const valid = draft.from !== '' && draft.to !== '' && draft.to >= draft.from;
  const halfDay: HalfDay = draft.from === draft.to && (draft.halfDay === 'am' || draft.halfDay === 'pm')
    ? draft.halfDay
    : 'none';
  const days = valid ? leaveDays({ from: draft.from, to: draft.to, halfDay }, holidays) : 0;

  return (
    <DialogForm>
      <Stack gap="sm">
        <NativeSelect
          data={(['vacation', 'special', 'unpaid'] as const).map((value) => ({ value, label: t(`absence.${value}`) }))}
          {...field.type({ onChange: change('type') })}
        />
        <Group grow align="flex-start">
          <DatePickerInput
            valueFormat="ll"
            popoverProps={{ floatingStrategy: 'fixed' }}
            {...field.from({ onChange: change('from') })}
          />
          <DatePickerInput
            valueFormat="ll"
            popoverProps={{ floatingStrategy: 'fixed' }}
            {...field.to({ onChange: change('to') })}
          />
        </Group>
        <NativeSelect
          data={(['none', 'am', 'pm'] as const).map((value) => ({ value, label: t(`halfDay.${value}`) }))}
          description={t('leave.halfDayHint')}
          {...field.halfDay({ onChange: change('halfDay') })}
        />
        <Textarea autosize minRows={2} {...field.note()} />
        {valid && (
          <Alert
            variant="light"
            color={draft.type === 'vacation' && days > balance.remaining ? 'danger' : 'accent'}
            p="xs"
          >
            <Text size="sm">
              {t('leave.workingDays', { count: days, days: formatDays(days) })}
              {draft.type === 'vacation'
                && ` · ${t('leave.leftAfter', { days: formatDays(balance.remaining - days) })}`}
            </Text>
          </Alert>
        )}
      </Stack>
    </DialogForm>
  );
}
