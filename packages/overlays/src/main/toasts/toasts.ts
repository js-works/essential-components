// Public entry point for the toasts feature: its values (the types are in ../api/toasts/,
// exported by the package's entries as the type namespace `overlays`). The implementation
// is split across the sibling modules (icons, element, styles, placement, theme and texts
// with the runtime defaults, view, controller). This file re-exports the public values,
// kept stable for ../index.ts and the package's `exports` map.
//
// Feature highlights over a bare toast core: six RTL-aware placements, mutable
// toasts (handle.set / a "loading" type / controller.promise), action buttons,
// overflow evict/queue, swipe-to-dismiss, pause-when-hidden, an opt-in
// aria-live region, and light/dark/solid appearances. Every option defaults to the
// original behaviour.

export { createToastController } from "./controller.js";
export { defaultToastTexts } from "./texts.js";
export { createToastTheme, defaultToastTheme } from "./theme.js";
