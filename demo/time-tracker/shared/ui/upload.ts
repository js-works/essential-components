import { createFileUploadComponent } from '@local/file-upload/react';
import { MANTINE_THEME } from '@local/file-upload/themes';

import { createDemoI18n } from '../../../../packages/file-upload/src/demo/i18n.js';

export { CertificateUpload };

const uploadI18n = createDemoI18n();

const CertificateUpload = createFileUploadComponent({
  i18n: { type: 'factory', getAdapter: () => uploadI18n },
  theme: MANTINE_THEME,
});
