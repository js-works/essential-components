import type { AriaAttributes, CSSProperties, ReactNode, Ref } from 'react';
import type * as Spec from '../api';

export type { Config, Props };

type Config = Omit<Spec.Config, 'i18n'> & {
  tagName?: string;
  i18n?: NonNullable<Spec.Config['i18n']> | { type: 'hook'; useAdapter: () => Spec.I18nAdapter };
};

type Props = AriaAttributes & {
  [key: `data-${string}`]: string | undefined;
  upload?: Spec.Upload;
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
  maxParallel?: number;
  multiple?: boolean;
  manualUpload?: boolean;
  previews?: boolean;
  density?: Spec.Density;
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
  onChange?: (items: readonly Spec.FileItem[]) => void;
  ref?: Ref<Spec.Element>;
};
