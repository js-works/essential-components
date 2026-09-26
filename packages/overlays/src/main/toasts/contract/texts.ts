// -------------------------------------------------------------------
// Localizable strings for toasts.
// -------------------------------------------------------------------

import type { ToastTexts, ToastTextResolver } from "./api.js";

export type { ToastTexts, ToastTextResolver };

/** Guaranteed-complete en-US fallback. */
export const defaultToastTexts: ToastTexts = {
  dismiss: "Dismiss notification",
  info: "Information",
  success: "Success",
  warn: "Warning",
  error: "Error",
  loading: "Loading",
};
