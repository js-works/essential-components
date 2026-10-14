// The themes of both features from one palette (createThemes() in themes/palette.ts).

import type { DialogTheme } from "./dialogs/theme.js";
import type { ToastTheme } from "./toasts/theme.js";

export type { ThemePalette, OverlayThemes };

/**
 * The colours an application actually thinks in. Each is a CSS colour — a literal, or a
 * `var(--your-token)` if your design system publishes one, in which case the derived
 * values follow it too.
 */
interface ThemePalette {
  /** Brand colour. Drives a dialog's primary button and a toast's info and loading. */
  primary?: string;
  success?: string;
  /** Toasts only — dialogs have no warning treatment. */
  warning?: string;
  /** Destructive. Drives a dialog's danger button and a toast's error. */
  danger?: string;
  /** Card and dialog background. */
  surface?: string;
  /** Body text on that surface. */
  text?: string;
  /**
   * Text placed on top of a filled accent. Left out, it is derived per accent with
   * `contrast-color()`, which resolves to white or black — whichever contrasts more.
   *
   * Worth setting explicitly for mid-tone brand colours: `contrast-color()` answers a
   * yes/no question, and for something like a medium blue it picks black, which is legible
   * in principle and poor for small text in practice.
   */
  onAccent?: string;
  /** Corner rounding for both surfaces. */
  radius?: string;
}

/**
 * Named rather than a tuple: positions would have to be remembered, and these two have
 * obvious names. Dialogs first, as everywhere else in the package.
 */
interface OverlayThemes {
  dialogTheme: DialogTheme;
  toastTheme: ToastTheme;
}
