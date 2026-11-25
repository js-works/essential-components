export { EN };

// The English (en-US) texts as functions of their values and the locale (the formatting follows it, e.g. `de-CH`
// numbers): the library's default when the adapter has no translation, and the master of the ICU messages in
// `locales/` (`src/test/texts/texts.test.ts` checks that they match). Only what ICU can express: values, `number()`.
// `size` and `types` come formatted (a size with its unit chosen by magnitude, a list): ICU cannot format them.
// `locale` is always a valid tag (the localizer checks it).

const number = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);

const EN = {
  dropHint: () => 'Drag files here or',
  browse: () => 'Browse',
  hintAccept: ({ types }: { types: string }) => `Allowed: ${types}`,
  hintMaxFiles: ({ count }: { count: number }, locale: string) => `Maximum number of files: ${number(count, locale)}`,
  hintMaxFileSize: ({ size }: { size: string }) => `Maximum size per file: ${size}`,
  // The name of the list.
  fileList: () => 'Files',
  statusReady: () => 'Ready to upload',
  statusQueued: () => 'Waiting',
  statusUploading: ({ percent }: { percent: number }, locale: string) => `Uploading ${number(percent, locale)}%`,
  statusDone: () => 'Uploaded',
  statusError: () => 'Upload failed',
  statusAborted: () => 'Canceled',
  rejectedType: () => 'This file type is not allowed',
  rejectedSize: ({ size }: { size: string }) => `The file is larger than ${size}`,
  rejectedCount: ({ count }: { count: number }, locale: string) =>
    `Too many files, the maximum is ${number(count, locale)}`,
  upload: () => 'Upload',
  uploadAll: () => 'Upload all',
  clear: () => 'Clear',
  cancel: () => 'Cancel',
  stop: () => 'Stop',
  retry: () => 'Retry',
  remove: () => 'Remove',
  showPreview: () => 'Show preview',
  closePreview: () => 'Close preview',
  // The validation messages (form association).
  validationFailed: () => 'Retry or remove the files that failed.',
  validationPending: () => 'Wait until all uploads are finished.',
  validationRequired: () => 'Please add a file.',
};
