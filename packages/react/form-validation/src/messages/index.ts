import type { MessageCatalog } from '../api/texts.js';
import { de } from './de.js';
import { en } from './en.js';

export { catalogs, localeCandidates };

const catalogs: Record<string, MessageCatalog> = {
  de,
  en,
};

/** "de-AT" -> ["de-AT", "de"] */
function localeCandidates(locale: string): string[] {
  const lang = locale.split(/[-_]/)[0] ?? locale;
  return [...new Set([locale, lang])];
}
