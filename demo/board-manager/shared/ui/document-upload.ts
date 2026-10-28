import { createFileUploadComponent } from '@local/file-upload/react';
import { MANTINE_THEME } from '@local/file-upload/themes';

import { i18nAdapter } from '../lib/i18n/index.js';

export { DocumentUpload };

const DocumentUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => i18nAdapter },
  theme: MANTINE_THEME,
});
