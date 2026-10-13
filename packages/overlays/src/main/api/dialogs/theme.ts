// -------------------------------------------------------------------
// Dialog theme: the tokens the dialog chrome understands. Build one with
// createDialogTheme() and pass it as `theme` to createDialogsController.
//
// The values are put straight into the dialog's stylesheet (see dialogs/element/styles.ts):
// the library defines no custom properties of its own.
// -------------------------------------------------------------------

export type { DialogTheme };

/** Theme tokens for dialogs. Every token is a CSS value string. */
interface DialogTheme {
  background: string;
  text: string;
  radius: string;
  /** Colour of the divider line between the body and the footer. */
  divider: string;
  primaryText: string;
  primaryBackground: string;
  secondaryText: string;
  secondaryBackground: string;
  secondaryBorder: string;
  dangerText: string;
  dangerBackground: string;
  /** Colour of the (rarely used) success button variant. */
  successAccent: string;
  closeRadius: string;
  actionRadius: string;
  /** Transition (duration + easing) for action-button hover/press state changes. */
  buttonTransition: string;
  /** Scale an action button shrinks to while pressed, e.g. "0.97"; set "1" to disable. */
  buttonActiveScale: string;
  /**
   * Base font size of the dialog (title, text, note); everything sized in em scales with
   * it. Set it to the host design system's body size, so a dialog's text matches the page
   * and the inputs in its content.
   */
  fontSize: string;
  /**
   * Font family of the dialog's text, e.g. the host design system's body font. The
   * built-in action buttons keep their own stack (one with a medium weight).
   */
  fontFamily: string;
  /**
   * Colour of the spinner placeholder's arc (the round dialog a scope shows while nothing
   * has opened yet), e.g. the host design system's primary colour. Its faint ring follows
   * the text colour.
   */
  spinner: string;
}
