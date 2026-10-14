import type { FileItem, UploadFn } from './upload.js';

export type { FileUploadClass, FileUploadElement, UploadDensity };

type UploadDensity = 'compact' | 'normal' | 'comfortable';

type FileUploadElement = HTMLElement & {
  upload: UploadFn | undefined;
  accept: string | undefined;
  maxFiles: number | undefined;
  maxFileSize: number | undefined;
  maxParallel: number;
  multiple: boolean;
  manualUpload: boolean;
  previews: boolean;
  density: UploadDensity;
  disabled: boolean;
  name: string | undefined;
  required: boolean;
  label: string | undefined;
  error: string | undefined;
  readonly items: readonly FileItem[];
  readonly form: HTMLFormElement | null;
  readonly labels: NodeList;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity: () => boolean;
  reportValidity: () => boolean;
  setCustomValidity: (message: string) => void;
};

type FileUploadClass = {
  new(): FileUploadElement;
  readonly prototype: FileUploadElement;
};
