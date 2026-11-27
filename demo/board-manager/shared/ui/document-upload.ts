import { createFileUploadComponent } from '@local/file-upload/react';
import { createMantineFileUploadTheme } from '@local/file-upload/themes';

import { i18nAdapter } from '../lib/i18n/index.js';

export { DocumentUpload };

const DocumentUpload = createFileUploadComponent({
  useI18n: () => i18nAdapter,
  theme: createMantineFileUploadTheme(),
});
