import type { MessageCatalog } from '../api/texts.js';
import { ar } from './ar.js';
import { de } from './de.js';
import { en } from './en.js';
import { es } from './es.js';
import { fr } from './fr.js';
import { hu } from './hu.js';
import { ru } from './ru.js';
import { zhCN, zhTW } from './zh.js';

export { catalogs, localeCandidates };

const catalogs: Record<string, MessageCatalog> = {
  de,
  en,
  fr,
  es,
  ru,
  hu,
  ar,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
};

/** "de-AT" -> ["de-AT", "de"], "zh-Hant-HK" -> ["zh-Hant-HK", "zh-TW"], "zh" -> ["zh", "zh-CN"] */
function localeCandidates(locale: string): string[] {
  const result = [locale];
  let loc: Intl.Locale | undefined;
  try {
    loc = new Intl.Locale(locale).maximize();
  } catch {
    /* an invalid locale string */
  }
  const lang = loc?.language ?? locale.split(/[-_]/)[0] ?? locale;
  if (lang === 'zh') result.push(loc?.script === 'Hant' ? 'zh-TW' : 'zh-CN');
  else result.push(lang);
  return [...new Set(result)];
}
