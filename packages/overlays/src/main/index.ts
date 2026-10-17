// Framework-free public entry point. Nothing reachable from here imports a UI framework;
// the lit adapters live behind the "@local/overlays/lit" subpath (src/main/lit.ts).

// # Types
// All of them, flat: `import type { DialogTheme } from "@local/overlays"`. The bindings' entries export them too,
// with their own types added.
export type * from "./api/index.js";
// # Dialogs
export * from "./dialogs/dialogs.js";
// # Bundled translations
// Used automatically when no `getText` is configured: the table matching <html lang> wins,
// English behind it. Exported so a caller writing their own resolver can build on them.
export { germanDialogTexts, germanToastTexts } from "./i18n/texts.js";
// # Themes
// Both features' themes from one palette. The per-feature createToastTheme /
// createDialogTheme come from the two blocks above and stay the finer-grained way in.
export { createThemes } from "./themes/palette.js";
// # Toasts
export * from "./toasts/toasts.js";
