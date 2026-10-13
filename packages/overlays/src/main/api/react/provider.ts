import type { ReactNode } from "react";
import type { DialogsControllerConfig } from "../dialogs/dialog.js";
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
  dialogs?: Omit<DialogsControllerConfig<ReactContent>, "adapter">;
  toasts?: Omit<ToastsControllerOptions<ReactToastContent>, "adapter">;
}

interface OverlaysProviderProps {
  /** Optional: omit it entirely for the built-in defaults. */
  config?: OverlaysConfig;
  /**
   * Change this to re-render the dialogs that are currently on screen.
   *
   * The library's own chrome — button labels, the default title, the header icon — is
   * resolved from `config.dialogs.getText` and `.icons` when a dialog's spec is built.
   * Your *content* is React and re-renders itself, so after a language switch a dialog
   * that stays open would show translated content next to untranslated buttons. Pass the
   * value that changes and both move together:
   *
   * ```tsx
   * const { i18n } = useTranslation();
   * <OverlaysProvider refreshKey={i18n.language} config={…}>
   * ```
   *
   * Anything comparable with `Object.is` works; nothing happens while it stays the same.
   */
  refreshKey?: unknown;
  children?: ReactNode;
}
