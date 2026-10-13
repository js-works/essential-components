// -------------------------------------------------------------------
// The small policy helpers the controller uses to build a view (the view model and the
// adapter contract: api/toasts/adapter.ts).
// -------------------------------------------------------------------

import type { ToastType } from "../api/toasts/toast.js";

// Shared per-severity opt-in check used by both the title and icon policies.
export function policyEnabled(
  policy: boolean | ToastType[] | undefined,
  type: ToastType,
): boolean {
  return Array.isArray(policy) ? policy.includes(type) : policy === true;
}

// error/warn interrupt (assertive); info/success/loading wait their turn (polite).
export function roleFor(type: ToastType): "alert" | "status" {
  return type === "error" || type === "warn" ? "alert" : "status";
}
