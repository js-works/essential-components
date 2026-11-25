import { describe, expect, it } from 'vitest';

import DE from '../../../locales/de.json' with { type: 'json' };
import EN_ICU from '../../../locales/en.json' with { type: 'json' };
import { EN } from '../../main/texts/en.js';

// The ICU messages in `locales/` must match the master (`texts/en.ts`): the same keys, the same values.
const KEYS = Object.keys(EN).sort();
const LANGUAGES: Readonly<Record<string, Readonly<Record<string, string>>>> = { en: EN_ICU, de: DE };

// The values of an ICU message: its arguments (`{count, number}`, `{size}`).
const icuNames = (text: string) => new Set([...text.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]));

const SAMPLES: Readonly<Record<string, unknown>> = { count: 3, percent: 42, size: '1.5 kB', types: '.pdf, image/*' };

const english = (key: string) => EN[key as keyof typeof EN] as (values: unknown, locale: string) => string;
const icu = (key: string) => EN_ICU[key as keyof typeof EN_ICU];

describe('the texts', () => {
  for (const [language, texts] of Object.entries(LANGUAGES)) {
    it(`locales/${language}.json: the keys and values of the master`, () => {
      expect(Object.keys(texts).sort()).toEqual(KEYS);
      for (const key of KEYS) expect(icuNames(texts[key]!), key).toEqual(icuNames(icu(key)));
    });
  }

  it('the English functions take the values of their ICU messages', () => {
    for (const key of KEYS) {
      const names = [...icuNames(icu(key))];
      const text = english(key)(Object.fromEntries(names.map((name) => [name, SAMPLES[name!]])), 'en-US');

      expect(text, key).not.toMatch(/undefined|NaN|[{}]/);
    }
  });

  it('the English default follows the formatting of the locale', () => {
    expect(EN.rejectedCount({ count: 1000 }, 'en-US')).toBe('Too many files, the maximum is 1,000');
    expect(EN.rejectedCount({ count: 1000 }, 'de-CH')).toBe(
      `Too many files, the maximum is ${(1000).toLocaleString('de-CH')}`,
    );
  });
});
