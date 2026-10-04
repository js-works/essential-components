import type { LibCatalog } from './de';

export { en };

const chars = { one: '# character', other: '# characters' };

const en: LibCatalog = {
  required: 'Please fill out this field.',
  invalid: 'Please check your input.',
  submitFailed: 'Something went wrong while submitting. Please try again.',
  email: 'Please enter a valid email address.',
  url: 'Please enter a valid URL.',
  format: 'The input does not have the expected format.',
  mustAccept: 'Please confirm this.',
  enum: 'Please select one of the available options.',
  'number.type': 'Please enter a number.',
  'number.int': 'Please enter a whole number.',
  'number.min': (p) => `The value must be at least ${p.min}.`,
  'number.max': (p) => `The value must be at most ${p.max}.`,
  'number.gt': (p) => `The value must be greater than ${p.min}.`,
  'number.lt': (p) => `The value must be less than ${p.max}.`,
  'number.between': (p) => `The value must be between ${p.min} and ${p.max}.`,
  'number.step': (p) => `The value must be a multiple of ${p.step}.`,
  'string.min': (_, c) => `Please enter at least ${c.count('min', chars)}.`,
  'string.max': (_, c) => `Please enter no more than ${c.count('max', chars)}.`,
  'string.between': (p) => `The input must be between ${p.min} and ${p.max} characters long.`,
  'string.length': (_, c) => `The input must be exactly ${c.count('length', chars)} long.`,
  'date.type': 'Please enter a valid date.',
  'date.min': (p) => `The date must not be before ${p.min}.`,
  'date.max': (p) => `The date must not be after ${p.max}.`,
};
