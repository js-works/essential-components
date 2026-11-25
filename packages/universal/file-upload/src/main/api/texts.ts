import type { EN } from '../texts/en.js';
import type { TextParams } from './i18n.js';

export type { FileUploadParams, FileUploadTextKey };

/** The keys of the library's texts (the namespace `'fileUpload'`). */
type FileUploadTextKey = keyof typeof EN;

/** The values each text gets in the adapter's `translate` (raw numbers; `size` and `types` formatted). */
type FileUploadParams = TextParams<typeof EN>;
