import { allTexts, bundleTexts } from "picolingo";

import { defaultDialogTexts, defaultToastTexts } from "../../index.js";
import { dialogTexts, toastTexts } from "./index.js";

export { englishTexts };

const englishTexts = bundleTexts({
  en: [
    allTexts(dialogTexts, defaultDialogTexts),
    allTexts(toastTexts, defaultToastTexts),
  ],
});
