import { describe, expect, it } from "vitest";

import DE from "../../../locales/de.json" with { type: "json" };
import EN_ICU from "../../../locales/en.json" with { type: "json" };
import { EN } from "../../main/texts/en.js";

// The ICU messages in `locales/` must match the master (`texts/en.ts`): the same keys, the same values.
const KEYS = Object.keys(EN).sort();
const LANGUAGES: Readonly<Record<string, Readonly<Record<string, string>>>> = { en: EN_ICU, de: DE };

// The values of an ICU message: its arguments (none so far).
const icuNames = (text: string) => new Set([...text.matchAll(/\{\s*(\w+)\s*[,}]/g)].map((m) => m[1]));


const english = (key: string) => EN[key as keyof typeof EN] as (values: unknown, locale: string) => string;
const icu = (key: string) => EN_ICU[key as keyof typeof EN_ICU];

describe("the texts", () => {
  for (const [language, texts] of Object.entries(LANGUAGES)) {
    it(`locales/${language}.json: the keys and values of the master`, () => {
      expect(Object.keys(texts).sort()).toEqual(KEYS);
      for (const key of KEYS) expect(icuNames(texts[key]!), key).toEqual(icuNames(icu(key)));
    });
  }

  it("the English texts have no values", () => {
    for (const key of KEYS) expect(english(key)(undefined, "en-US"), key).toBe(icu(key));
  });
});
