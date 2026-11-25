import type { EN } from '../texts/en.js';
import type { TextParams } from './i18n.js';

export type { CockpitParams, CockpitTextKey };

/** The keys of the texts of the cockpit and the app header (the namespace `'cockpit'`). */
type CockpitTextKey = keyof typeof EN;

/** The values each text gets in the adapter's `translate` (raw: numbers as numbers). */
type CockpitParams = TextParams<typeof EN>;
