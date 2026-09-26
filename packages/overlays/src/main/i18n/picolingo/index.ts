import { defaultDialogTexts, defaultToastTexts } from "../../index.js";
import type { DialogTexts, ToastTexts } from "../../index.js";
import { createNamespace } from "picolingo";

export { dialogTexts, toastTexts };

const dialogTexts = createNamespace<DialogTexts>({
  key: "overlays.dialogs",
  defaults: defaultDialogTexts,
});

const toastTexts = createNamespace<ToastTexts>({
  key: "overlays.toasts",
  defaults: defaultToastTexts,
});
