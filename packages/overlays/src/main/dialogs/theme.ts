// -------------------------------------------------------------------
// Dialog theme: the tokens the dialog chrome understands. Build one with
// createDialogTheme() and pass it as `theme` to createDialogsController.
//
// The values are put straight into the dialog's stylesheet (see dialogs/element/styles.ts):
// the library defines no custom properties of its own.
// -------------------------------------------------------------------

import type { DialogTheme } from "../api/dialogs/theme.js";

/**
 * Built-in dialog defaults — dark-mode-aware surface via `light-dark(...)`. Plain values:
 * the library reads no custom properties of the page; a host sets its colors through the
 * theme.
 */
export const defaultDialogTheme: DialogTheme = {
  background: "light-dark(white, #333)",
  text: "light-dark(black, white)",
  radius: "6px",
  divider: "light-dark(#e5e7eb, rgba(255, 255, 255, 0.12))",
  primaryText: "#ffffff",
  primaryBackground: "#007EC6",
  secondaryText: "#1f2430",
  secondaryBackground: "white",
  secondaryBorder: "#b0b0b0",
  dangerText: "white",
  dangerBackground: "#D03B3B",
  successAccent: "#00883c",
  closeRadius: "100%",
  actionRadius: "5px",
  buttonTransition: "120ms ease",
  buttonActiveScale: "1",
  fontSize: "16px",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  spinner: "#444",
};

/** Merge partial tokens over {@link defaultDialogTheme} to produce a full DialogTheme. */
export function createDialogTheme(
  overrides?: Partial<DialogTheme>,
): DialogTheme {
  return { ...defaultDialogTheme, ...overrides };
}
