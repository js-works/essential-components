// -------------------------------------------------------------------
// The render seam: the fully-resolved view model the core hands to an adapter, plus the
// adapter contract and the small policy helpers the controller uses to build a view.
// -------------------------------------------------------------------

import type {
  ToastAdapter,
  ToastAdapterFactory,
  ToastAppearance,
  ToastType,
  ToastView,
} from "./api.js";

export type { ToastAdapter, ToastAdapterFactory, ToastAppearance, ToastView };

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
