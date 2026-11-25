import type { EN } from '../texts/en.js';
import type { TextParams } from './i18n.js';

export type { DataTableParams, DataTableTextKey };

/** The keys of the library's texts (the namespace `'dataTable'`). */
type DataTableTextKey = keyof typeof EN;

/** The values each text gets in the adapter's `translate` (raw: numbers as numbers). */
type DataTableParams = TextParams<typeof EN>;
