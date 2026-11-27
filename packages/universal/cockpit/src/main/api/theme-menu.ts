import type { NavDensity } from './base.js';
import type { I18nAdapter } from './i18n.js';
import type { CockpitAction, MenuSection } from './menus.js';

export type { ThemeMenu, ThemeMenuAccent, ThemeMenuOptions, ThemeMenuScheme, ThemeMenuValue };

// `system`: the operating system's.
type ThemeMenuScheme = 'light' | 'system' | 'dark';

// A choice of accent color (`color`: any CSS color, for the host to apply).
type ThemeMenuAccent = {
  id: string;
  label: string;
  color: string;
};

// The user's choice: the color scheme, the accent's `id` (`''` without accents), the density.
type ThemeMenuValue = {
  scheme: ThemeMenuScheme;
  accent: string;
  density: NavDensity;
};

type ThemeMenuOptions = {
  // The section "Accent color" (none without).
  accents?: readonly ThemeMenuAccent[];
  // The section "Density" (compact, normal, comfortable); only when every part of the app follows it.
  densities?: boolean;
  // The choice until the user makes one (default: `system`, the first accent, `normal`): also one the host has kept
  // (it is not remembered here; a value no longer offered is the default).
  initial?: Partial<ThemeMenuValue>;
  // The labels (the namespace `'cockpit'`, the keys `themeMenu…`), read whenever the menu renders. Without one: English.
  i18n?: I18nAdapter;
  // The button's icon (SVG markup; default: a palette).
  icon?: string;
  // Applies the choice: called once at the start (in a microtask, after the module's code, so the host's elements are
  // defined) and after every choice.
  onChange: (value: ThemeMenuValue) => void;
};

// The theme menu of `createThemeMenu()`: a button of the cockpit with the menu (`action`, for its `actions`), or its
// sections for another menu (`sections`, e.g. the user menu), the current choice (`value()`), and a choice made by
// code (`set()`: `onChange` called).
type ThemeMenu = {
  readonly action: CockpitAction;
  readonly sections: readonly MenuSection[];
  value(): ThemeMenuValue;
  set(value: Partial<ThemeMenuValue>): void;
};
