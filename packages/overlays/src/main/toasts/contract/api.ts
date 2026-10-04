export type {
  OverflowMode,
  Placement,
  ToastAction,
  ToastAdapter,
  ToastAdapterFactory,
  ToastAppearance,
  ToastHandle,
  ToastOptions,
  ToastsController,
  ToastsControllerOptions,
  ToastSize,
  ToastSpec,
  ToastTextResolver,
  ToastTexts,
  ToastTheme,
  ToastType,
  ToastView,
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

type Placement =
  | "top-start"
  | "top-center"
  | "top-end"
  | "bottom-start"
  | "bottom-center"
  | "bottom-end";

type OverflowMode = "evict" | "queue";

type ToastSize = "small" | "medium" | "large";

interface ToastTheme {
  background: string;
  text: string;
  radius: string;
  shadow: string;
  infoAccent: string;
  successAccent: string;
  warnAccent: string;
  errorAccent: string;
  loadingAccent: string;
  titleColor: string;
  messageColor: string;
  closeColor: string;
  closeHoverColor: string;
  closeHoverBackground: string;
  solidText: string;
  darkBackground: string;
  darkText: string;
  darkCloseColor: string;
  progressColor?: string;
  iconColor?: string;
  actionColor?: string;
}

type ToastTexts = Record<
  "dismiss" | "info" | "success" | "warn" | "error" | "loading",
  string
>;

type ToastTextResolver = (key: keyof ToastTexts) => string | undefined;

type ToastAppearance = "light" | "dark" | "solid";

interface ToastView<C> {
  id: number;
  type: ToastType;
  role: "alert" | "status" | "none";
  duration: number;
  dismissLabel: string;
  iconMode: "custom" | "default" | "none";
  icon: C | null;
  severity: string | null;
  title: C | null;
  message: C;
  actions: { label: C }[];
  dismissible: boolean;
  appearance: ToastAppearance;
}

interface ToastAdapter<C> {
  render(views: ToastView<C>[]): void;
  destroy?(): void;
}

type ToastAdapterFactory<C> = (context: {
  container: HTMLElement;
  tag: string;
}) => ToastAdapter<C>;

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
  getText?: ToastTextResolver;
  autoTitles?: boolean | ToastType[];
  autoIcons?: boolean | ToastType[];
  maxVisible?: number;
  overflow?: OverflowMode;
  placement?: Placement;
  stacked?: boolean;
  dismissOnSwipe?: boolean;
  pauseOnHidden?: boolean;
  liveRegion?: boolean;
  appearance?: ToastAppearance | Partial<Record<ToastType, ToastAppearance>>;
}
