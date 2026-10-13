import type { ReactElement, ReactNode } from "react";
import type { FormConfirm } from "../dialogs/dialog.js";

export type { FormProps, ReactContent, ReactToastContent };

/**
 * Content a React controller accepts: an element (so `<>{…}</>` covers a list), or the
 * plain `string` every adapter takes. It is an element rather than the whole `ReactNode`
 * union because the core's content type is constrained to an object — the same reason the
 * Lit adapter's is `TemplateResult` and not "anything Lit can render".
 */
type ReactContent = ReactElement;

/**
 * Content a React toast accepts: anything React can render. Wider than the dialog side's
 * {@link ReactContent}, which the dialogs core constrains to an object — toasts take `C`
 * bare (there is no `| string` in their content union), so the whole `ReactNode` is both
 * usable and necessary for a plain-string message to type-check.
 */
type ReactToastContent = ReactNode;

interface FormProps {
  /**
   * The form's own confirmation, run on the dialog's confirm click instead of the dialog's
   * validation: it validates, does the work (e.g. saves) and returns the outcome (see
   * {@link FormConfirm}). A form library provides it, e.g. form-validation's
   * `requestSubmit`.
   */
  confirm: FormConfirm;
  /**
   * Whether the form has changes, asked when the dialog is about to close (Cancel, Escape,
   * the close button): while it says `true`, the dialog first asks in place of the dialog's content,
   * "Discard your changes?" (Discard, Keep editing; the dialog's texts `questionDiscard`,
   * `buttonDiscard`, `buttonKeepEditing`; Escape answers Discard there, see
   * `FormAttempt.askDiscard`). A function, asked at that moment, so typing
   * needs no re-render: e.g. form-validation's `isDirty`. Without it the dialog closes at
   * once. A loop with `guardClose` decides itself instead.
   */
  dirty?: () => boolean;
  children?: ReactNode;
}
