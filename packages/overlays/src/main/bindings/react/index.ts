// -------------------------------------------------------------------
// "@local/overlays/react" — dialogs and toasts as React.
// -------------------------------------------------------------------
//
// Wrap your app in <OverlaysProvider> and reach for `useDialogs()` / `useToast()`. Both
// features render through the provider, so content is ordinary JSX with your context
// available to it, and an open dialog is reconciled rather than rebuilt — what the user
// has typed into a form survives an update.
//
// `react` and `react-dom` are peer dependencies here (and only here — the main entry
// stays framework-free). Nothing is injected at runtime any more: this module imports
// React itself, so the hooks can share a single provider-owned portal registry.

export { OverlaysProvider, useDialogs, useToast } from "./provider.js";
export { Form } from "./dialog-adapter.js";

// The types (with all of the main entry's): `import type { overlays } from "@local/overlays/react"`.
export type * as overlays from "../../api/react/index.js";
