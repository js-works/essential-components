import { allTexts, bundleTexts } from "picolingo";

import { germanDialogTexts, germanToastTexts } from "../texts.js";
import { dialogTexts, toastTexts } from "./index.js";

export { germanTexts };

// The strings themselves live in the core, where the zero-config path reads them too —
// this only re-packages them for picolingo. Same shape as english.ts, which has always
// wrapped the core's defaults rather than restating them.
const germanTexts = bundleTexts({
  de: [
    allTexts(dialogTexts, germanDialogTexts),
    allTexts(toastTexts, germanToastTexts),
  ],
});
