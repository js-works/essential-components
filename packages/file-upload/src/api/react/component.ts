import type { AriaAttributes, CSSProperties, ReactNode, Ref } from 'react';
import type { FileUploadClassConfig } from '../config.js';
import type { FileUploadElement, UploadDensity } from '../element.js';
import type { I18nAdapter } from '../i18n.js';
import type { FileItem, UploadFn } from '../upload.js';

export type { FileUploadComponentConfig, FileUploadProps };

type FileUploadComponentConfig = Omit<FileUploadClassConfig, 'i18n'> & {
  tagName?: string;
  i18n?: NonNullable<FileUploadClassConfig['i18n']> | { type: 'hook'; useAdapter: () => I18nAdapter };
};

type FileUploadProps = AriaAttributes & {
  [key: `data-${string}`]: string | undefined;
  upload?: UploadFn;
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  maxParallel?: number;
  multiple?: boolean;
  manualUpload?: boolean;
  previews?: boolean;
  density?: UploadDensity;
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
