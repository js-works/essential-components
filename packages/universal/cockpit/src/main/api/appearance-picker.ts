import type { I18nAdapter } from './i18n.js';
import type { CockpitTheme } from './theme.js';

export type {
  AppearanceAccent,
  AppearancePickerClass,
  AppearancePickerClassConfig,
  AppearancePickerElement,
  AppearanceScheme,
};

type AppearancePickerClassConfig = {
  // Fixed per class: it reads `accentColor`, `fontSize`, `fontFamily`, `buttonBorderRadius`.
  theme?: CockpitTheme;
  // The texts (the namespace `'cockpit'`, the keys `appearancePicker…`): the adapter, the same for every element of the
  // class. Without one: English and en-US.
  i18n?: I18nAdapter;
};

type AppearancePickerClass = new() => AppearancePickerElement;

// `system`: the operating system's.
type AppearanceScheme = 'light' | 'system' | 'dark';

// A choice of accent color: `color` any CSS color (the swatch).
type AppearanceAccent = {
  id: string;
  label: string;
  color: string;
};

// The user's choice of the look: the color scheme (Light, System, Dark) and, with `accents`, the accent color. Only
// what every part of an app can follow (no density: most UI libraries have none). It applies nothing itself: on a
// choice it updates `scheme` and `accent` and fires `change` (an `Event`, bubbling, like an input's); the host applies
// them (e.g. `<html data-scheme>`, the cockpit's `theme`, its apps' accent). No background of its own: for a settings
// page or a popover.
type AppearancePickerElement = HTMLElement & {
  // The attribute `scheme` (default `system`; an invalid attribute is the default, an invalid value a `RangeError`).
  scheme: AppearanceScheme;
  // The accents to choose from; `[]`: no accent section.
  accents: readonly AppearanceAccent[];
  // The chosen accent's `id`; `''` (or an unknown id): none chosen.
  accent: string;
};
