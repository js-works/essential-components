import { Group, NumberInput, Stack, Text, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { SALARY_REASONS } from '../../../domain';
import type { SalaryChange } from '../../../domain';
import { formatMoney } from '../../../shared/lib/format';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';
import { FormSelect } from '../../../shared/ui/FormSelect';

export { SalaryForm, salarySchema };

// A change of the salary: from a date on (not before the first day: the server says so), the new yearly gross, why,
// a note.
const salarySchema = z.object({
  from: z.string().min(1),
  amount: z.number().min(1),
  reason: z.enum(SALARY_REASONS),
  note: z.string().trim().default(''),
});

function SalaryForm({ current, from, save }: {
  current: SalaryChange | undefined;
  from: string;
  save: (values: z.output<typeof salarySchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(salarySchema, {
    labels: 'salaryForm',
    initial: { from, amount: current?.amount, reason: 'raise' },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        {current !== undefined && (
          <Text size="sm" c="dimmed">{t('salary.current', { amount: formatMoney(current.amount) })}</Text>
        )}
        <Group grow align="flex-start">
          <NumberInput
            allowDecimal={false}
            thousandSeparator
            min={0}
            step={1000}
            prefix="€ "
            data-autofocus
            {...field.amount()}
          />
          <DatePickerInput valueFormat="ll" popoverProps={{ floatingStrategy: 'fixed' }} {...field.from()} />
        </Group>
        <FormSelect
          data={SALARY_REASONS.map((value) => ({ value, label: t(`salaryReason.${value}`) }))}
          {...field.reason()}
        />
        <Textarea autosize minRows={2} {...field.note()} />
      </Stack>
    </DialogForm>
  );
}
