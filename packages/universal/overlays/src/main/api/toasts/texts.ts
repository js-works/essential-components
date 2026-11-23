export type { ToastTextResolver, ToastTexts };

type ToastTexts = Record<
  "dismiss" | "info" | "success" | "warn" | "error" | "loading",
  string
>;

type ToastTextResolver = (key: keyof ToastTexts) => string | undefined;
