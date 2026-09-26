export type {
  Config,
  Element,
  ElementClass,
  FileItem,
  FileStatus,
  I18nAdapter,
  Rejection,
  TextKey,
  TextParams,
  Theme,
  ThemeColor,
  Upload,
  UploadContext,
};

type UploadContext = {
  signal: AbortSignal;
  onProgress: (fraction: number) => void;
};

type Upload = (file: File, context: UploadContext) => Promise<string | void>;

type FileStatus = 'ready' | 'queued' | 'uploading' | 'done' | 'error' | 'aborted' | 'rejected';

type Rejection = 'type' | 'size' | 'count';

type FileItem = {
  id: string;
  file: File;
  status: FileStatus;
  progress: number;
  rejection?: Rejection;
  error?: unknown;
  result?: string;
};

type Element = HTMLElement & {
  upload: Upload | undefined;
  accept: string | undefined;
  maxFiles: number | undefined;
  maxFileSize: number | undefined;
  maxParallel: number;
  multiple: boolean;
  manualUpload: boolean;
  previews: boolean;
  disabled: boolean;
  name: string | undefined;
  required: boolean;
  label: string | undefined;
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
  new(): Element;
  readonly prototype: Element;
};

type ThemeColor = string | { light: string; dark: string };

type Theme = {
  accentColor?: ThemeColor;
  accentTextColor?: ThemeColor;
  textColor?: ThemeColor;
  mutedColor?: ThemeColor;
  borderColor?: ThemeColor;
  surfaceColor?: ThemeColor;
  successColor?: ThemeColor;
  dangerColor?: ThemeColor;
  borderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
};

type I18nAdapter = {
  currentLocale: () => string;
  resolveText: (
    namespace: string,
    key: string,
    params: Readonly<Record<string, unknown>> | null,
    defaultValue: string,
  ) => string;
  onChange?: (listener: () => void) => () => void;
};

type TextParams = {
  dropHint: null;
  browse: null;
  hintAccept: { types: string };
  hintMaxFiles: { count: number };
  hintMaxFileSize: { size: string };
  fileList: null;
  statusReady: null;
  statusQueued: null;
  statusUploading: { percent: number };
  statusDone: null;
  statusError: null;
  statusAborted: null;
  rejectedType: null;
  rejectedSize: { size: string };
  rejectedCount: { count: number };
  upload: null;
  uploadAll: null;
  clear: null;
  cancel: null;
  stop: null;
  retry: null;
  remove: null;
  showPreview: null;
  closePreview: null;
  validationFailed: null;
  validationPending: null;
  validationRequired: null;
};

type TextKey = keyof TextParams;

type Config = {
  theme?: Theme;
  styles?: string;
  i18n?: { type: 'factory'; getAdapter: (element: Element) => I18nAdapter };
};
