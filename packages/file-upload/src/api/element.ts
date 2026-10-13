import type { FileItem, Upload } from './upload.js';

export type { Density, ElementClass, FileUploadElement };

type Density = 'compact' | 'normal' | 'comfortable';

type FileUploadElement = HTMLElement & {
  upload: Upload | undefined;
  accept: string | undefined;
  maxFiles: number | undefined;
  maxFileSize: number | undefined;
  maxParallel: number;
  multiple: boolean;
  manualUpload: boolean;
  previews: boolean;
  density: Density;
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

type ElementClass = {
  new(): FileUploadElement;
  readonly prototype: FileUploadElement;
};
