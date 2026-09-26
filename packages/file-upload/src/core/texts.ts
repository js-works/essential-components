import type * as Spec from '../api';

export { createLocalizer };
export type { Localizer };

// The namespace of our texts in an `I18nAdapter`.
const NAMESPACE = 'fileupload';

const FALLBACK_LOCALE = 'en-US';

const SIZE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

// The English texts of last resort. Numbers are formatted in the current locale.
const DEFAULT_TEXTS: {
  readonly [K in Spec.TextKey]: (params: Spec.TextParams[K], numbers: Intl.NumberFormat) => string;
} = {
  dropHint: () => 'Drag files here or',
  browse: () => 'Browse',
  hintAccept: ({ types }) => `Allowed: ${types}`,
  hintMaxFiles: ({ count }, numbers) => `Maximum number of files: ${numbers.format(count)}`,
  hintMaxFileSize: ({ size }) => `Maximum size per file: ${size}`,
  fileList: () => 'Files',
  statusReady: () => 'Ready to upload',
  statusQueued: () => 'Waiting',
  statusUploading: ({ percent }, numbers) => `Uploading ${numbers.format(percent)}%`,
  statusDone: () => 'Uploaded',
  statusError: () => 'Upload failed',
  statusAborted: () => 'Canceled',
  rejectedType: () => 'This file type is not allowed',
  rejectedSize: ({ size }) => `The file is larger than ${size}`,
  rejectedCount: ({ count }, numbers) => `Too many files, the maximum is ${numbers.format(count)}`,
  upload: () => 'Upload',
  uploadAll: () => 'Upload all',
  clear: () => 'Clear',
  cancel: () => 'Cancel',
  stop: () => 'Stop',
  retry: () => 'Retry',
  remove: () => 'Remove',
  showPreview: () => 'Show preview',
  closePreview: () => 'Close preview',
  validationFailed: () => 'Retry or remove the files that failed.',
  validationPending: () => 'Wait until all uploads are finished.',
  validationRequired: () => 'Please add a file.',
};

// Texts and formatting for one render, in the locale that the adapter reports right now.
type Localizer = {
  readonly text: <K extends Spec.TextKey>(key: K, params: Spec.TextParams[K]) => string;
  readonly formatSize: (bytes: number) => string;
};

// Without an adapter: the English texts, formatted in en-US.
function createLocalizer(i18n: Spec.I18nAdapter | undefined): Localizer {
  const locale = i18n?.currentLocale() ?? FALLBACK_LOCALE;
  const numbers = numberFormat(locale);

  return {
    text: (key, params) => {
      const defaultValue = DEFAULT_TEXTS[key](params, numbers);

      return i18n === undefined ? defaultValue : i18n.resolveText(NAMESPACE, key, params, defaultValue);
    },
    formatSize: (bytes) => formatSize(bytes, locale),
  };
}

// An invalid locale falls back to en-US instead of throwing.
function numberFormat(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
  try {
    return new Intl.NumberFormat(locale, options);
  } catch {
    return new Intl.NumberFormat(FALLBACK_LOCALE, options);
  }
}

// Formats a size in bytes with the unit that fits (1 kB = 1024 bytes).
function formatSize(bytes: number, locale: string): string {
  let value = bytes;
  let unit = 0;

  while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
    value /= 1024;
    unit++;
  }

  return numberFormat(locale, {
    style: 'unit',
    unit: SIZE_UNITS[unit] ?? 'byte',
    unitDisplay: 'short',
    maximumFractionDigits: unit === 0 ? 0 : 1,
  }).format(value);
}
