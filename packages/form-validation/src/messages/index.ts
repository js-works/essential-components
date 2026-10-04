import type { MessageCatalog } from '../types';
import { ar } from './ar';
import { de, type LibCatalog, type MessageKey } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { hu } from './hu';
import { ru } from './ru';
import { zhCN, zhTW } from './zh';

export { catalogs, localeCandidates };
export type { LibCatalog, MessageKey };

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
