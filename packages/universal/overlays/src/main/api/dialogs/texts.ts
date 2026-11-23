import type { defaultDialogTexts } from "../../dialogs/texts.js";

export type { DialogTexts };

type DialogTexts = Record<keyof typeof defaultDialogTexts, string>;
