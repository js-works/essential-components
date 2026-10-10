// -------------------------------------------------------------------
// # Button configs
// -------------------------------------------------------------------

import type { ActionButtonType, ButtonRole, DialogAction } from "../contract/dialog.js";
import type { TextKey } from "../contract/texts.js";

export type { ButtonRole } from "../contract/dialog.js";

export interface ButtonConfig {
  /** Result identity. `cancel` resolves the canceled branch; the others map to actions. */
  id: symbol;
  /** Which `config.buttons.*` entry overrides this button's text; `null` for an action. */
  overrideKey: ButtonRole | null;
  type: ActionButtonType;
  text?: string | null;
  defaultTextKey: TextKey;
  /** Whether pressing this button should submit + validate the (optional) form. */
  validate: boolean;
  /** The id of one of the dialog's own actions (see DialogConfig.actions). */
  action?: string;
  /** Whether it stands separate, on the other side of the footer (danger and link actions). */
  separate?: boolean;
}

// The dialog's own actions as buttons, in the order given: after the primary button,
// the separate ones (danger, link) last, which the footer puts on its other side.
export function withActions(
  buttons: ButtonConfig[],
  actions: Record<string, string | DialogAction> | undefined,
): ButtonConfig[] {
  if (!actions) {
    return buttons;
  }
  const own = Object.entries(actions).map(([action, value]): ButtonConfig => {
    const options = typeof value === "string" ? { text: value } : value;
    const type = options.variant ?? "secondary";
    return {
      id: Symbol(action),
      overrideKey: null,
      type,
      text: options.text,
      defaultTextKey: "buttonOk",
      validate: options.validate ?? true,
      action,
      separate: type !== "secondary",
    };
  });
  const [primary, ...rest] = buttons;
  return [
    ...(primary ? [primary] : []),
    ...own.filter((button) => !button.separate),
    ...rest,
    ...own.filter((button) => button.separate),
  ];
}

export const symbolOk = Symbol("ok");
export const symbolCancel = Symbol("cancel");
export const symbolConfirm = Symbol("confirm");
export const symbolDecline = Symbol("decline");

// All button configurations, built by one small factory: btn(id, overrideKey,
// type, defaultTextKey). Buttons that submit + validate the form are exactly the
// non-secondary ones, so `validate` is derived rather than repeated.
function btn(
  id: symbol,
  overrideKey: ButtonRole,
  type: ActionButtonType,
  defaultTextKey: TextKey,
): ButtonConfig {
  return {
    id,
    overrideKey,
    type,
    defaultTextKey,
    validate: type !== "secondary",
  };
}

export const okBtn = btn(symbolOk, "ok", "primary", "buttonOk");
export const okBtnDanger = btn(symbolOk, "ok", "danger", "buttonOk");
export const confirmBtn = btn(symbolConfirm, "confirm", "primary", "buttonOk");
export const confirmBtnDanger = btn(symbolConfirm, "confirm", "danger", "buttonOk");
export const cancelBtn = btn(symbolCancel, "cancel", "secondary", "buttonCancel");
export const yesBtn = btn(symbolConfirm, "confirm", "primary", "buttonYes");
export const yesBtnDanger = btn(symbolConfirm, "confirm", "danger", "buttonYes");
export const noBtn = btn(symbolDecline, "decline", "secondary", "buttonNo");
