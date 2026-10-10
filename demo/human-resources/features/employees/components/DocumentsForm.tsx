import { Stack, Text } from '@mantine/core';
import type { ReactElement } from 'react';
import { z } from 'zod';
import type { FileUpload } from '../../../../../packages/file-upload/src';
import { binding } from '../../../../../packages/form-validation/src';
import { DOCUMENT_CATEGORIES } from '../../../domain';
import { useTranslate } from '../../../shared/lib/i18n';
import { useForm } from '../../../shared/lib/useForm';
import { FormSelect } from '../../../shared/ui/FormSelect';
import { DocumentUpload } from '../../../shared/ui/upload';

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
  fromComponent: (items: readonly FileUpload.FileItem[]) => {
    const files = items
      .filter((item) => item.status !== 'rejected')
      .map(({ status, result }) => ({ status, result }));

    return files.length === 0 ? undefined : files;
  },
});

function DocumentsForm({ name, upload, save }: {
  name: string;
  upload: FileUpload.Upload;
  save: (values: z.output<typeof documentsSchema>) => Promise<void>;
}): ReactElement {
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
