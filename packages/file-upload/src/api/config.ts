import type { FileUploadElement } from './element.js';
import type { I18nAdapter } from './i18n.js';
import type { Theme } from './theme.js';

export type { Config };

type Config = {
  theme?: Theme;
  styles?: string;
  i18n?: { type: 'factory'; getAdapter: (element: FileUploadElement) => I18nAdapter };
};
