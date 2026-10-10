import { Stack, Switch, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';

export { EndForm, endSchema };

// The end of an employment: the last day (not before the first: the server says so), and whether the offboarding
// checklist starts (unless there is one).
const endSchema = z.object({
  endDate: z.string().min(1),
  offboarding: z.boolean().default(false),
});

function EndForm({ name, initial, canStartOffboarding, save }: {
  name: string;
  initial: string;
  canStartOffboarding: boolean;
  save: (values: z.output<typeof endSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(endSchema, {
    labels: 'endForm',
    initial: { endDate: initial, offboarding: canStartOffboarding },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm">{t('employees.endExplain', { name })}</Text>
        <DatePickerInput
          valueFormat="ll"
          popoverProps={{ floatingStrategy: 'fixed' }}
          data-autofocus
          {...field.endDate()}
        />
        {canStartOffboarding && <Switch {...field.offboarding()} />}
      </Stack>
    </DialogForm>
  );
}
