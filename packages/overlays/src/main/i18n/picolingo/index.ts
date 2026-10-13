import { defaultDialogTexts, defaultToastTexts } from "../../index.js";
import type { overlays } from "../../index.js";
import { createNamespace } from "picolingo";

export { dialogTexts, toastTexts };

const dialogTexts = createNamespace<overlays.DialogTexts>({
  key: "overlays.dialogs",
  defaults: defaultDialogTexts,
});

const toastTexts = createNamespace<overlays.ToastTexts>({
  key: "overlays.toasts",
  defaults: defaultToastTexts,
});
