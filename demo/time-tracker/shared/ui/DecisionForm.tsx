import { Stack, Text, Textarea } from '@mantine/core';
import type { ReactElement } from 'react';
import { z } from 'zod';
import type { Decision } from '../../domain';
import { useForm } from '../lib/useForm';

export { DecisionForm, decisionSchema };

// The decision of a team lead on requests (leave, corrections): what is decided (`summary`), and a comment for the
// employee, required for a rejection (it says why), optional for an approval.
const decisionSchema = z.object({ comment: z.string().trim().default('') });
const rejectionSchema = z.object({ comment: z.string().trim().min(1) });

function DecisionForm({ decision, summary, save }: {
  decision: Decision;
  summary: string;
  save: (values: { comment: string }) => Promise<void>;
}): ReactElement {
  const { DialogForm, field } = useForm(decision === 'rejected' ? rejectionSchema : decisionSchema, {
    labels: 'decisionForm',
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm" style={{ whiteSpace: 'pre-line' }}>{summary}</Text>
        <Textarea autosize minRows={2} data-autofocus {...field.comment()} />
      </Stack>
    </DialogForm>
  );
}
