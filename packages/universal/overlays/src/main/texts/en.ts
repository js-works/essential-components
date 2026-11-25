export { EN };

// The English (en-US) texts of the dialogs and the toasts: the default when the adapter has no translation, and the
// master of the ICU messages in `locales/`. None has values. The `*Critical` titles repeat their siblings in English
// on purpose: separate keys, so a translation can tell them apart.

const EN = {
  // The dialogs'.
  buttonOk: () => "OK",
  buttonCancel: () => "Cancel",
  buttonYes: () => "Yes",
  buttonNo: () => "No",
  titleInfo: () => "Information",
  titleSuccess: () => "Success",
  titleWarn: () => "Warning",
  titleError: () => "Error",
  titleConfirm: () => "Confirmation",
  titleConfirmCritical: () => "Confirmation",
  titleDecide: () => "Please decide",
  titleDecideCritical: () => "Please decide",
  titleForm: () => "Form",
  titleFormCritical: () => "Form",
  labelMaximize: () => "Maximize",
  labelRestore: () => "Restore",
  questionDiscard: () => "Discard your changes?",
  buttonDiscard: () => "Discard",
  buttonKeepEditing: () => "Keep editing",
  titleUnsavedChanges: () => "Unsaved changes",
  hintEscapeDiscards: () => "Press Esc to discard them.",
  // The toasts': `dismiss` names the close button, the others are the titles and names of the types.
  dismiss: () => "Dismiss notification",
  info: () => "Information",
  success: () => "Success",
  warn: () => "Warning",
  error: () => "Error",
  loading: () => "Loading",
};
