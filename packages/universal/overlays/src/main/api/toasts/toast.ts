import type { I18nAdapter } from "../i18n.js";
import type { ToastAdapterFactory, ToastAppearance } from "./adapter.js";
import type { ToastTheme } from "./theme.js";

export type {
  ToastAction,
  ToastHandle,
  ToastOptions,
  ToastOverflow,
  ToastPlacement,
  ToastSize,
  ToastSpec,
  ToastsController,
  ToastsControllerOptions,
  ToastType,
};

type ToastType = "info" | "success" | "warn" | "error" | "loading";

interface ToastAction<C> {
  label: C;
  onClick?: () => void | boolean | Promise<void | boolean>;
}

interface ToastOptions<C> {
  title?: C | false;
  icon?: C | false;
  message: C | string;
  duration?: number;
  actions?: ToastAction<C>[];
  dismissible?: boolean;
}

type ToastSpec<C> = ToastOptions<C> | string;

interface ToastHandle<C> {
  dismiss(): void;
  set(descriptor: { type: ToastType } & ToastOptions<C>): void;
}

interface ToastsController<C> {
  show(descriptor: { type: ToastType } & ToastOptions<C>): ToastHandle<C>;
  info(spec: ToastSpec<C>): ToastHandle<C>;
  success(spec: ToastSpec<C>): ToastHandle<C>;
  warn(spec: ToastSpec<C>): ToastHandle<C>;
  error(spec: ToastSpec<C>): ToastHandle<C>;
  loading(spec: ToastSpec<C>): ToastHandle<C>;
  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: ToastSpec<C>;
      success: ToastSpec<C> | ((value: T) => ToastSpec<C>);
      error: ToastSpec<C> | ((error: unknown) => ToastSpec<C>);
    },
  ): Promise<T>;
  clear(): void;
  configure(options: Omit<ToastsControllerOptions<C>, "adapter">): void;
  destroy(): void;
}

type ToastPlacement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

type ToastOverflow = "evict" | "queue";

type ToastSize = "small" | "medium" | "large";

interface ToastsControllerOptions<C> {
  adapter: ToastAdapterFactory<C>;
  /**
   * Where the toast stack is mounted: read once, when the first toast is shown (so it
   * may point at an element that does not exist yet when the controller is created).
   * Default (and while it returns nothing): `document.body`. The React provider sets it
   * to its own mount point, so the stack lives where the provider is - in a shadow root
   * too. The stack is `position: fixed`: an ancestor with `transform`, `filter` or
   * `contain` makes it position against that ancestor instead of the viewport.
   */
  mountTarget?: () => ParentNode | null | undefined;
  theme?: Partial<ToastTheme>;
  size?: ToastSize;
  /**
   * The app's i18n (`frontend/i18n.md`): the texts of the toasts (the namespace `'overlays'`), read when they render;
   * its `onChange` renders the stack again. Without it: English.
   */
  i18n?: I18nAdapter;
  autoTitles?: boolean | ToastType[];
  autoIcons?: boolean | ToastType[];
  maxVisible?: number;
  overflow?: ToastOverflow;
  placement?: ToastPlacement;
  stacked?: boolean;
  dismissOnSwipe?: boolean;
  pauseOnHidden?: boolean;
  liveRegion?: boolean;
  appearance?: ToastAppearance | Partial<Record<ToastType, ToastAppearance>>;
}
