// -------------------------------------------------------------------
// Localizable strings for toasts.
// -------------------------------------------------------------------

import type { ToastTexts } from "../api/toasts/texts.js";

/** Guaranteed-complete en-US fallback. */
export const defaultToastTexts: ToastTexts = {
  dismiss: "Dismiss notification",
  info: "Information",
  success: "Success",
  warn: "Warning",
  error: "Error",
  loading: "Loading",
};
