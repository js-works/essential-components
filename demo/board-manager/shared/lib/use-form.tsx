import { defineForm } from '@local/micro-app';

import { AppError } from './app-error.js';
import { translateKey } from './i18n/index.js';

export { useForm };

// The app's form hook (`@local/micro-app`): form-validation's `useForm` (its texts from the app's i18next: the labels of
// the app's keys, `labels: '<form>'`, the messages of form-validation's catalogs) with `DialogForm` for a form dialog;
// the message of an invalid field as a popover. The fake server's errors are meant for the user (an `AppError`: a key
// and its values, translated here).
const useForm = defineForm({
  errorMessage: (error) => (error instanceof AppError ? translateKey(`errors.${error.key}`, error.params) : undefined),
});
