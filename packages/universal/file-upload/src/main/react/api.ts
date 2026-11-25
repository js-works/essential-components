import type { AriaAttributes, CSSProperties, ReactNode, Ref } from 'react';

import type { FileItem, FileUploadDensity, FileUploadElement, UploadFunction } from '../api/base.js';
import type { I18nAdapter } from '../api/i18n.js';
import type { FileUploadTheme } from '../api/theme.js';

export type { FileUploadComponentConfig, FileUploadProps };

type FileUploadComponentConfig = {
  theme?: FileUploadTheme;
  styles?: string;
  useI18n?: () => I18nAdapter;
};

type FileUploadProps = AriaAttributes & {
  [key: `data-${string}`]: string | undefined;
  upload?: UploadFunction;
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  maxParallel?: number;
  multiple?: boolean;
  manualUpload?: boolean;
  previews?: boolean;
  density?: FileUploadDensity;
  disabled?: boolean;
  name?: string;
  required?: boolean;
  lang?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
  prompt?: ReactNode;
  icon?: ReactNode;
  limits?: ReactNode;
  label?: ReactNode;
  error?: ReactNode;
  onChange?: (items: readonly FileItem[]) => void;
  ref?: Ref<FileUploadElement>;
};
