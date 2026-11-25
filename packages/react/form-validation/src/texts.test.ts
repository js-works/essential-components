import { describe, expect, it } from 'vitest';

import DE from '../locales/de.json' with { type: 'json' };
import EN_ICU from '../locales/en.json' with { type: 'json' };
import { EN } from './texts/en.js';

// The ICU messages in `locales/` must match the master (`texts/en.ts`): the same keys, the same values.
const KEYS = Object.keys(EN).sort();
const LANGUAGES: Readonly<Record<string, Readonly<Record<string, string>>>> = { en: EN_ICU, de: DE };

// The values of an ICU message: its arguments (`{min, number}`, `{count, plural, …}`), not the plural options.
const icuNames = (text: string) => new Set([...text.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]));

const SAMPLES: Readonly<Record<string, unknown>> = { min: 2, max: 40, step: 5, count: 3 };
const DATE_SAMPLES: Readonly<Record<string, unknown>> = { min: new Date(2026, 0, 1), max: new Date(2026, 11, 31) };

const english = (key: string) => EN[key as keyof typeof EN] as (values: unknown, locale: string) => string;

describe('the texts', () => {
  for (const [language, texts] of Object.entries(LANGUAGES)) {
    it(`locales/${language}.json: the keys and values of the master`, () => {
      expect(Object.keys(texts).sort()).toEqual(KEYS);
      for (const key of KEYS) expect(icuNames(texts[key]!), key).toEqual(icuNames(EN_ICU[key as keyof typeof EN_ICU]));
    });
  }

  it('the English functions take the values of their ICU messages', () => {
    for (const key of KEYS) {
      const samples = key.startsWith('date.') ? DATE_SAMPLES : SAMPLES;
      const names = [...icuNames(EN_ICU[key as keyof typeof EN_ICU])];
      const text = english(key)(Object.fromEntries(names.map((name) => [name, samples[name!]])), 'en-US');
      expect(text, key).not.toMatch(/undefined|NaN|Invalid Date|[{}]/);
    }
  });

  it('the English default: plurals, and the formatting of the locale', () => {
    expect(EN['string.min']({ count: 1 }, 'en-US')).toBe('Please enter at least 1 character.');
    expect(EN['string.min']({ count: 1000 }, 'en-US')).toBe('Please enter at least 1,000 characters.');
    expect(EN['number.min']({ min: 1000 }, 'de-CH')).toBe(
      `The value must be at least ${(1000).toLocaleString('de-CH')}.`,
    );
    expect(EN['date.max']({ max: new Date(2026, 10, 23) }, 'en-US')).toBe('The date must not be after Nov 23, 2026.');
    expect(EN['date.max']({ max: new Date(2026, 10, 23) }, 'en-GB')).toBe('The date must not be after 23 Nov 2026.');
  });
});
