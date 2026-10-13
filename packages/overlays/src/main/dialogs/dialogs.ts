// Public entry point for the dialogs feature: its values (the types are in ../api/dialogs/,
// exported by the package's entries as the type namespace `overlays`). The implementation
// is split across the sibling modules (form-data, theme and texts with the runtime
// defaults, buttons, icons, styles, view, element, controller); this file just re-exports
// the public values, kept stable for ../index.ts and the package's `exports` map.

export { createDialogsController } from "./controller/controller.js";
export { Dialog } from "./element/element.js";
export { createDialogTheme, defaultDialogTheme } from "./theme.js";
export { defaultDialogTexts } from "./texts.js";
export { FormDialogData } from "./form-data.js";
