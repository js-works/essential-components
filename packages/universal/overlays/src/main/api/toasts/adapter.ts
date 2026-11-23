import type { ToastType } from "./toast.js";

export type { ToastAdapter, ToastAdapterFactory, ToastAppearance, ToastView };

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
