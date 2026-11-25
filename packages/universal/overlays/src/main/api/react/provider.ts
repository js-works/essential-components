import type { ReactNode } from "react";

import type { DialogsControllerConfig } from "../dialogs/dialog.js";
import type { I18nAdapter } from "../i18n.js";
import type { ToastsControllerOptions } from "../toasts/toast.js";
import type { ReactContent, ReactToastContent } from "./content.js";

export type { OverlaysConfig, OverlaysProviderProps };

/**
 * Set-up for both features, minus the adapters — the provider supplies those.
 *
 * Live: change it and the change applies, with no remount and nothing on screen thrown
 * away. Dialog config is read when a dialog opens, so it takes effect from the *next*
 * one — a dialog already on screen keeps what it opened with, and whatever the user has
 * typed into it survives. Toast config is applied to the running stack immediately.
 *
 * It is deliberately one object rather than two props: there is no change detection
 * behind this (the current values are simply written through on every commit), so an
 * inline `config={{…}}` — a fresh object on every render — is free and safe.
 */
interface OverlaysConfig {
  /**
   * The app's i18n (`frontend/i18n.md`), for the dialogs and the toasts alike (the namespace `'overlays'`). The
   * provider is rendered by the app, so the app builds it with its own hooks; a dialog on screen follows its
   * `onChange`, and a new adapter. Without it: English.
   */
  i18n?: I18nAdapter;
  dialogs?: Omit<DialogsControllerConfig<ReactContent>, "adapter" | "i18n">;
  toasts?: Omit<ToastsControllerOptions<ReactToastContent>, "adapter" | "i18n">;
}

interface OverlaysProviderProps {
  /** Optional: omit it entirely for the built-in defaults. */
  config?: OverlaysConfig;
  children?: ReactNode;
}
