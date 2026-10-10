import { createDemoI18n } from '../../../../packages/file-upload/demo/i18n';
import type { FileUpload } from '../../../../packages/file-upload/src';
import { createFileUploadComponent } from '../../../../packages/file-upload/src/react';

export { DocumentUpload };

const uploadI18n = createDemoI18n();

// The file upload in Mantine's look: its theme values are Mantine's variables (inherited into its shadow DOM from the
// scope), so it follows Mantine's color scheme and the contrast of the app's theme, like the data table's
// `mantineTheme`.
const MANTINE_UPLOAD_THEME: FileUpload.Theme = {
  accentColor: 'var(--mantine-primary-color-filled)',
  accentTextColor: 'var(--mantine-primary-color-contrast)',
  textColor: 'var(--mantine-color-text)',
  mutedColor: 'var(--mantine-color-dimmed)',
  borderColor: 'var(--mantine-color-default-border)',
  surfaceColor: 'var(--mantine-color-default-hover)',
  successColor: 'var(--mantine-color-green-text)',
  dangerColor: 'var(--mantine-color-error)',
  borderRadius: 'var(--mantine-radius-default)',
  buttonBorderRadius: 'var(--mantine-radius-default)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
};

const DocumentUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
  theme: MANTINE_UPLOAD_THEME,
});
