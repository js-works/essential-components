import { Group, Stack, Text, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import type { ReactElement } from 'react';
import { z } from 'zod';
import type { FileUpload } from '../../../../../packages/file-upload/src';
import { binding } from '../../../../../packages/form-validation/src';
import { CERTIFICATE_FROM_DAY } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';
import { CertificateUpload } from '../../../shared/ui/upload';

export { CertificateForm, certificateSchema, SickForm, sickSchema };

// A sick call: the first day, the last one as far as known, a note (no diagnosis needed).
const sickSchema = z
  .object({
    from: z.string().min(1),
    to: z.string().min(1),
    note: z.string().trim().default(''),
  })
  .refine((values) => values.to >= values.from, { path: ['to'], message: 'errors.endBeforeStart' });

function SickForm({ initial, save }: {
  initial: { from: string; to: string; note?: string };
  save: (values: z.output<typeof sickSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(sickSchema, { labels: 'sickForm', initial, submit: save });

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">{t('sick.explain', { day: CERTIFICATE_FROM_DAY })}</Text>
        <Group grow align="flex-start">
          <DatePickerInput valueFormat="ll" popoverProps={{ floatingStrategy: 'fixed' }} {...field.from()} />
          <DatePickerInput valueFormat="ll" popoverProps={{ floatingStrategy: 'fixed' }} {...field.to()} />
        </Group>
        <Textarea autosize minRows={2} {...field.note()} />
      </Stack>
    </DialogForm>
  );
}

// The doctor's note: one file (a PDF or a photo), uploaded at once. Its value is the state of the file (no file: no
// value, so "required"); a failed or unfinished upload is an error of the field, shown by the upload. "Save" attaches
// the uploaded file. Like the Board Manager's upload form.
const certificateSchema = z.object({
  files: z
    .array(z.object({ status: z.string(), result: z.string().optional() }))
    .min(1)
    .refine(
      (files) => !files.some((file) => file.status === 'error' || file.status === 'aborted'),
      'errors.uploadFailed',
    )
    .refine((files) => files.every((file) => file.status === 'done'), 'errors.uploadPending'),
});

const uploadFiles = binding({
  fromComponent: (items: readonly FileUpload.FileItem[]) => {
    const files = items
      .filter((item) => item.status !== 'rejected')
      .map(({ status, result }) => ({ status, result }));

    return files.length === 0 ? undefined : files;
  },
});

function CertificateForm({ upload, save }: {
  upload: FileUpload.Upload;
  save: (values: z.output<typeof certificateSchema>) => Promise<void>;
}): ReactElement {
  const t = useTranslate();
  const { DialogForm, field } = useForm(certificateSchema, { labels: 'certificateForm', submit: save });

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">{t('sick.certificateExplain')}</Text>
        <CertificateUpload
          className="time-tracker__upload"
          accept="application/pdf,image/*"
          upload={upload}
          {...field.files(uploadFiles)}
        />
      </Stack>
    </DialogForm>
  );
}
