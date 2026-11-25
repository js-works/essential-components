import type { EN } from "../texts/en.js";
import type { TextParams } from "./i18n.js";

export type { OverlaysParams, OverlaysTextKey };

/** The keys of the texts of the dialogs and the toasts (the namespace `'overlays'`). */
type OverlaysTextKey = keyof typeof EN;

/** The values each text gets in the adapter's `translate` (none so far: every text is `null`). */
type OverlaysParams = TextParams<typeof EN>;
