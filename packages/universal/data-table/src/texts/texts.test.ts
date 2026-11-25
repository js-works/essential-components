import { describe, expect, it } from 'vitest';

import DE from '../../locales/de.json' with { type: 'json' };
import EN_ICU from '../../locales/en.json' with { type: 'json' };
import { EN } from './en.js';

// The ICU messages in `locales/` must match the master (`texts/en.ts`): the same keys, the same values.
const KEYS = Object.keys(EN).sort();
const LANGUAGES: Readonly<Record<string, Readonly<Record<string, string>>>> = { en: EN_ICU, de: DE };

// The values of an ICU message: its arguments (`{count, number}`, `{label}`).
const icuNames = (text: string) => new Set([...text.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]));

const SAMPLES: Readonly<Record<string, unknown>> = {
  count: 3,
  from: 1,
  to: 10,
  total: 60,
  item: 5,
  page: 2,
  pages: 6,
  position: 4,
  shown: 2,
  label: 'Ann',
  name: 'Recent',
};

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
    expect(EN.itemRange({ from: 1, to: 10, total: 12345 }, 'en-US')).toBe('1-10 of 12,345');
    expect(EN.itemRange({ from: 1, to: 10, total: 12345 }, 'de-CH')).toBe(
      `1-10 of ${(12345).toLocaleString('de-CH')}`,
    );
  });
});
