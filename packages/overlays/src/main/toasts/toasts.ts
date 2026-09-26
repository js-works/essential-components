// Public entry point for the toasts feature. The implementation is split across the
// sibling modules: the public contract lives under contract/ (api.ts is the canonical
// source for every public type; theme.ts/texts.ts also carry the runtime defaults), the
// rest (icons, element, styles, placement, adapters, controller) alongside this file.
// This file re-exports the public surface, kept stable for ../index.ts and the package's
// `exports` map.
//
// Feature highlights over a bare toast core: six RTL-aware placements, mutable
// toasts (handle.set / a "loading" type / controller.promise), action buttons,
// overflow evict/queue, swipe-to-dismiss, pause-when-hidden, an opt-in
// aria-live region, and light/dark/solid appearances. Every option defaults to the
// original behaviour.

export { createToastController } from "./controller.js";
export { createToastTheme, defaultToastTheme } from "./contract/theme.js";
export { defaultToastTexts } from "./contract/texts.js";
export type { ToastTheme } from "./contract/theme.js";

export type { ToastTextResolver, ToastTexts } from "./contract/texts.js";
export type {
  OverflowMode,
  Placement,
  ToastAction,
  ToastAdapter,
  ToastAdapterFactory,
  ToastAppearance,
  ToastHandle,
  ToastOptions,
  ToastsController,
  ToastsControllerOptions,
  ToastSize,
  ToastSpec,
  ToastType,
  ToastView,
} from "./contract/api.js";
