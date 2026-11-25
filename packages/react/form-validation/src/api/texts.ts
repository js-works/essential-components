import type { EN } from '../texts/en.js';
import type { TextParams } from './i18n.js';

export type { FormValidationParams, FormValidationTextKey };

/** The keys of the library's messages (the namespace `'formValidation'`). */
type FormValidationTextKey = keyof typeof EN;

/** The values each message gets in the adapter's `translate` (raw: numbers as numbers, dates as `Date`). */
type FormValidationParams = TextParams<typeof EN>;
