import type { z } from 'zod';
import type { ErrorData } from './i18n';
import type { FieldInfo } from './schema';

export { DEFAULT_MESSAGE, issueToError };

/**
 * Set as the error text of all default errors when parsing. Messages given
 * explicitly in the schema take precedence in Zod and are kept.
 */
const DEFAULT_MESSAGE = '\u0000form-validation:default';

const FORMAT_KEYS: Record<string, string> = {
  email: 'email',
  url: 'url',
  date: 'date.type',
  datetime: 'date.type',
  time: 'format',
};

function asDate(v: unknown) {
  return typeof v === 'number' || typeof v === 'bigint' ? new Date(Number(v)) : v;
}

function issueToError(iss: z.core.$ZodIssue, info: FieldInfo | undefined, value: unknown): ErrorData {
  if (iss.message !== DEFAULT_MESSAGE) return { key: iss.message, custom: true };
  if (value === undefined && iss.code !== 'custom') return { key: 'required' };

  switch (iss.code) {
    case 'invalid_type':
      if (iss.expected === 'number') return { key: 'number.type' };
      if (iss.expected === 'int') return { key: 'number.int' };
      if (iss.expected === 'date') return { key: 'date.type' };
      return { key: 'invalid' };

    case 'too_small':
    case 'too_big': {
      const small = iss.code === 'too_small';
      const bound = small ? (iss as any).minimum : (iss as any).maximum;
      const inclusive = (iss as any).inclusive !== false;
      switch (iss.origin) {
        case 'string': {
          const { minLength, maxLength } = info ?? {};
          if (minLength != null && maxLength != null) {
            if (minLength === maxLength) return { key: 'string.length', params: { length: minLength } };
            return { key: 'string.between', params: { min: minLength, max: maxLength } };
          }
          return small ? { key: 'string.min', params: { min: bound } } : { key: 'string.max', params: { max: bound } };
        }
        case 'number':
        case 'int':
        case 'bigint': {
          if (!inclusive) {
            return small ? { key: 'number.gt', params: { min: bound } } : { key: 'number.lt', params: { max: bound } };
          }
          if (info?.min != null && info?.max != null) {
            return { key: 'number.between', params: { min: info.min, max: info.max } };
          }
          return small ? { key: 'number.min', params: { min: bound } } : { key: 'number.max', params: { max: bound } };
        }
        case 'date':
          return small
            ? { key: 'date.min', params: { min: asDate(bound) } }
            : { key: 'date.max', params: { max: asDate(bound) } };
        default:
          return { key: 'invalid' };
      }
    }

    case 'invalid_format':
      return { key: FORMAT_KEYS[(iss as any).format] ?? 'format' };

    case 'not_multiple_of':
      return { key: 'number.step', params: { step: (iss as any).divisor } };

    case 'invalid_value': {
      const values = (iss as any).values as unknown[];
      if (values.length === 1 && values[0] === true) return { key: 'mustAccept' };
      return { key: 'enum' };
    }

    default:
      return { key: 'invalid' };
  }
}
