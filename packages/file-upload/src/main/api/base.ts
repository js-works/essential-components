import type { I18nAdapter } from './i18n.js';
import type { FileUploadTheme } from './theme.js';

export type {
  FileItem,
  FileRejection,
  FileStatus,
  FileUploadClass,
  FileUploadClassConfig,
  FileUploadDensity,
  FileUploadElement,
  UploadFunction,
  UploadParams,
};

type FileUploadClassConfig = {
  theme?: FileUploadTheme;
  styles?: string;
  i18n?: { type: 'factory'; getAdapter: (element: FileUploadElement) => I18nAdapter };
};

type FileUploadClass = {
  new(): FileUploadElement;
  readonly prototype: FileUploadElement;
};

type FileUploadDensity = 'compact' | 'normal' | 'comfortable';

type FileUploadElement = HTMLElement & {
  upload: UploadFunction | null; // uploads one file; files wait as queued while it is null
  accept: string; // allowed types, like a file input's: '.pdf, image/*'; '' allows all
  maxFiles: number; // at most this many files in the list (rejected ones do not count); Infinity by default
  maxFileSize: number; // at most this many bytes per file; Infinity by default
  maxParallel: number; // uploads at a time, at least 1; 3 by default
  multiple: boolean; // several files; else a new file replaces the current one
  manualUpload: boolean; // files wait as ready until the user starts them
  previews: boolean; // thumbnails of images
  density: FileUploadDensity; // the vertical room of the rows; 'normal' by default
  disabled: boolean; // nothing can be added or changed
  name: string; // the form field's name; '' submits nothing
  required: boolean; // invalid until a file is done
  label: string; // our own label above the element; '' shows none
  error: string; // an error text below the element; '' shows none
  readonly items: readonly FileItem[]; // the list, a new array on every change
  readonly form: HTMLFormElement | null; // the form the element belongs to
  readonly labels: NodeList; // the <label>s of the element
  readonly validity: ValidityState; // like <input>'s
  readonly validationMessage: string; // why it is invalid; '' when valid
  readonly willValidate: boolean; // false while disabled
  checkValidity: () => boolean; // like <input>'s
  reportValidity: () => boolean; // like <input>'s, the message shown as the error
  setCustomValidity: (message: string) => void; // like <input>'s; '' clears it
};

type UploadParams = {
  file: File;
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
};

type UploadFunction = (params: UploadParams) => Promise<string | void>;

type FileStatus = 'ready' | 'queued' | 'uploading' | 'done' | 'error' | 'aborted' | 'rejected';

type FileRejection = 'type' | 'size' | 'count';

type FileItem = {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  rejection?: FileRejection;
  error?: unknown;
  result?: string;
};
