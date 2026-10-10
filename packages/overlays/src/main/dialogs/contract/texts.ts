// -------------------------------------------------------------------
// # Default texts
// -------------------------------------------------------------------

// Keys are named <category><Thing> so the category is readable without knowing the
// library, and so a key named for a thing can't box out a later key for the same thing in
// another role ("Information" is both a title and, potentially, a button).
export const defaultDialogTexts = {
  buttonOk: "OK",
  buttonCancel: "Cancel",
  buttonYes: "Yes",
  buttonNo: "No",

  // The `*Critical` titles duplicate their non-critical siblings in English on purpose —
  // they're separate keys so a translator can differentiate where a language would. Don't
  // collapse them.
  titleInfo: "Information",
  titleSuccess: "Success",
  titleWarn: "Warning",
  titleError: "Error",
  titleConfirm: "Confirmation",
  titleConfirmCritical: "Confirmation",
  titleDecide: "Please decide",
  titleDecideCritical: "Please decide",
  titleForm: "Form",
  titleFormCritical: "Form",

  // The two states of the maximize button (see DialogConfig.maximizable): its aria-label
  // and tooltip.
  labelMaximize: "Maximize",
  labelRestore: "Restore",

  // The question a form dialog asks before closing while its content has changes (React:
  // `<Form dirty>`), and its two answers. Escape answers it with Discard, which the hint
  // below the question says (only with a keyboard).
  questionDiscard: "Discard your changes?",
  buttonDiscard: "Discard",
  buttonKeepEditing: "Keep editing",
  titleUnsavedChanges: "Unsaved changes",
  hintEscapeDiscards: "Press Esc to discard them.",
} as const;

export type DialogTexts = Record<keyof typeof defaultDialogTexts, string>;

export type TextKey = keyof typeof defaultDialogTexts;
