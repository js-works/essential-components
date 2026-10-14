import type { FileUploadElement } from './element.js';
import type { I18nAdapter } from './i18n.js';
import type { FileUploadTheme } from './theme.js';

export type { FileUploadClassConfig };

type FileUploadClassConfig = {
  theme?: FileUploadTheme;
  styles?: string;
  i18n?: { type: 'factory'; getAdapter: (element: FileUploadElement) => I18nAdapter };
};
