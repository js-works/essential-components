import type { AriaAttributes, CSSProperties, ReactNode, Ref } from 'react';
import type { Config } from '../config.js';
import type { Density, FileUploadElement } from '../element.js';
import type { I18nAdapter } from '../i18n.js';
import type { FileItem, Upload } from '../upload.js';

export type { ComponentConfig, Props };

type ComponentConfig = Omit<Config, 'i18n'> & {
  tagName?: string;
  i18n?: NonNullable<Config['i18n']> | { type: 'hook'; useAdapter: () => I18nAdapter };
};

type Props = AriaAttributes & {
  [key: `data-${string}`]: string | undefined;
  upload?: Upload;
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  maxParallel?: number;
  multiple?: boolean;
  manualUpload?: boolean;
  previews?: boolean;
  density?: Density;
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
