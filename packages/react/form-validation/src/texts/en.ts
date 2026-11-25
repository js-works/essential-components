export { EN };

// The English (en-US) messages as functions of their values and the locale (the formatting follows it, e.g. `en-GB`
// dates): the library's default when the adapter has no translation, and the master of the ICU messages in `locales/`
// (`en.json`, `de.json`, derived from it; `src/texts.test.ts` checks that they match). Only what ICU can express:
// values, `number()`, `date()`, and the plural by `count === 1`. No other logic.

const number = (value: number, locale: string) => new Intl.NumberFormat(locale).format(value);
const date = (value: Date, locale: string) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(value);
const characters = (count: number, locale: string) =>
  `${number(count, locale)} ${count === 1 ? 'character' : 'characters'}`;

const EN = {
  // A required field is empty.
  required: () => 'Please fill out this field.',
  // Any other invalid value without a message of its own.
  invalid: () => 'Please check your input.',
  // A `submit` threw, without a message of the app (`errorMessage`).
  submitFailed: () => 'Something went wrong while submitting. Please try again.',
  email: () => 'Please enter a valid email address.',
  url: () => 'Please enter a valid URL.',
  // A string format without a message of its own (e.g. a time).
  format: () => 'The input does not have the expected format.',
  // `z.literal(true)`, e.g. accepting the terms.
  mustAccept: () => 'Please confirm this.',
  enum: () => 'Please select one of the available options.',
  'number.type': () => 'Please enter a number.',
  'number.int': () => 'Please enter a whole number.',
  'number.min': ({ min }: { min: number }, locale: string) => `The value must be at least ${number(min, locale)}.`,
  'number.max': ({ max }: { max: number }, locale: string) => `The value must be at most ${number(max, locale)}.`,
  // An exclusive minimum (`gt`).
  'number.gt': ({ min }: { min: number }, locale: string) => `The value must be greater than ${number(min, locale)}.`,
  // An exclusive maximum (`lt`).
  'number.lt': ({ max }: { max: number }, locale: string) => `The value must be less than ${number(max, locale)}.`,
  // A minimum and a maximum together.
  'number.between': ({ min, max }: { min: number; max: number }, locale: string) =>
    `The value must be between ${number(min, locale)} and ${number(max, locale)}.`,
  'number.step': ({ step }: { step: number }, locale: string) =>
    `The value must be a multiple of ${number(step, locale)}.`,
  // `count`: the minimum length.
  'string.min': ({ count }: { count: number }, locale: string) => `Please enter at least ${characters(count, locale)}.`,
  // `count`: the maximum length.
  'string.max': ({ count }: { count: number }, locale: string) =>
    `Please enter no more than ${characters(count, locale)}.`,
  // A minimum and a maximum length together.
  'string.between': ({ min, max }: { min: number; max: number }, locale: string) =>
    `The input must be between ${number(min, locale)} and ${number(max, locale)} characters long.`,
  // `count`: the exact length (minimum and maximum alike).
  'string.length': ({ count }: { count: number }, locale: string) =>
    `The input must be exactly ${characters(count, locale)} long.`,
  'date.type': () => 'Please enter a valid date.',
  'date.min': ({ min }: { min: Date }, locale: string) => `The date must not be before ${date(min, locale)}.`,
  'date.max': ({ max }: { max: Date }, locale: string) => `The date must not be after ${date(max, locale)}.`,
};
