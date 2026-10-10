import { Stack, Text, Textarea } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { addDays, todayDate } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';

export { CorrectionForm, correctionSchema };

// A forgotten stretch of work: the day (a past one), from and to, and why. The end after the start is the schema's
// rule; the server refuses a stretch that overlaps the day's work.
const correctionSchema = z
  .object({
    date: z.string().min(1),
    start: z.string().regex(/^\d\d:\d\d$/),
    end: z.string().regex(/^\d\d:\d\d$/),
    reason: z.string().trim().min(1),
  })
  .refine((values) => values.end > values.start, { path: ['end'], message: 'errors.endBeforeStart' });

function CorrectionForm({ date, save }: {
  date: string;
  save: (values: z.output<typeof correctionSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(correctionSchema, {
    labels: 'correctionForm',
    initial: { date, start: '13:00', end: '17:00' },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">{t('correction.explain')}</Text>
        <DatePickerInput
          maxDate={addDays(todayDate(), -1)}
          valueFormat="ll"
          popoverProps={{ floatingStrategy: 'fixed' }}
          {...field.date()}
        />
        <TimeInput {...field.start()} />
        <TimeInput {...field.end()} />
        <Textarea autosize minRows={2} data-autofocus {...field.reason()} />
      </Stack>
    </DialogForm>
  );
}
