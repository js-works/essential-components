import { Stack, Text } from '@mantine/core';
import { z } from 'zod';

import type { FileItem, UploadFn } from '@local/file-upload';
import { binding } from '@local/form-validation';

import { DOCUMENT_CATEGORIES } from '../../../domain/index.js';
import { useTranslate } from '../../../shared/lib/i18n/index.js';
import { useForm } from '../../../shared/lib/use-form.js';
import { FormSelect } from '../../../shared/ui/form-select.js';
import { DocumentUpload } from '../../../shared/ui/upload.js';

export { DocumentsForm, documentsSchema };

// Documents for an employee's records: their category, and the files, uploaded at once. The files' value is the state
// of each file (no file: no value, so "required"); a failed or unfinished upload is an error of the field, shown by the
// upload. "Save" attaches the uploaded files. Like the Time Tracker's doctor's note.
const documentsSchema = z.object({
  category: z.enum(DOCUMENT_CATEGORIES),
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
  fromComponent: (items: readonly FileItem[]) => {
    const files = items
      .filter((item) => item.status !== 'rejected')
      .map(({ status, result }) => ({ status, result }));

    return files.length === 0 ? undefined : files;
  },
});

function DocumentsForm({ name, upload, save }: {
  name: string;
  upload: UploadFn;
  save: (values: z.output<typeof documentsSchema>) => Promise<void>;
}) {
  const t = useTranslate();
  const { DialogForm, field } = useForm(documentsSchema, {
    labels: 'documentsForm',
    initial: { category: 'other' },
    submit: save,
  });

  return (
    <DialogForm>
      <Stack gap="sm">
        <Text size="sm" c="dimmed">{t('documents.explain', { name })}</Text>
        <FormSelect
          data={DOCUMENT_CATEGORIES.map((value) => ({ value, label: t(`documentCategory.${value}`) }))}
          {...field.category()}
        />
        <DocumentUpload
          className="human-resources__upload"
          accept="application/pdf,image/*,.doc,.docx"
          multiple
          upload={upload}
          {...field.files(uploadFiles)}
        />
      </Stack>
    </DialogForm>
  );
}
