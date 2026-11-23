import type { Dictionary } from '@blocknote/core';
import * as locales from '@blocknote/core/locales';
import { useEffect, useState } from 'react';

export { dictionaryOf, useDocumentLanguage };

// The language of the page (`<html lang>`), followed while it changes.
function useDocumentLanguage(): string {
  const [language, setLanguage] = useState(() => document.documentElement.lang);

  useEffect(() => {
    const observer = new MutationObserver(() => setLanguage(document.documentElement.lang));

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

    return () => observer.disconnect();
  }, []);

  return language;
}

// BlockNote's own texts (its menus, placeholders, tooltips) in a language: its locale of the language (`de` for
// `de-DE`, `zhTW` for `zh-TW`), else English; with `placeholder` for the empty editor.
function dictionaryOf(language: string, placeholder: string | undefined): Dictionary {
  const all = locales as unknown as Record<string, Dictionary>;
  const [main = '', region = ''] = language.toLowerCase().split('-');
  const dictionary = all[`${main}${region.toUpperCase()}`] ?? all[main] ?? locales.en;

  return placeholder === undefined
    ? dictionary
    : { ...dictionary, placeholders: { ...dictionary.placeholders, default: placeholder, emptyDocument: placeholder } };
}
