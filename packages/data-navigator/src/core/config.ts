import { createContext } from 'react';
import type { CSSProperties } from 'react';
import type { DataNavigatorComponent as Spec } from '../react/api';
import { defaultTheme } from '../themes/default';

export { ConfigContext, resolveConfig };
export type { ResolvedConfig };

// The configuration of a created component, ready to use: the i18n adapter as given, and the theme as the inline
// custom properties of the root.
type ResolvedConfig = {
  i18n: Spec.I18nAdapter | undefined;
  themeStyle: CSSProperties;
};

// Passed down privately by the created component, e.g. to the built-in filters (which render their own texts).
const ConfigContext = createContext<ResolvedConfig>(resolveConfig({}));

// `colorTextDimmed` → `--datnav-color-text-dimmed`. The custom properties are internal: apps configure the theme only.
function propertyOf(key: string): string {
  return `--datnav-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

// A value with a light and a dark variant follows the color scheme of the page.
function valueOf(value: Spec.ThemeValue): string {
  return typeof value === 'string' ? value : `light-dark(${value.light}, ${value.dark})`;
}

// Missing theme values come from the default theme, so the table always has its look.
function resolveConfig(config: Spec.Config): ResolvedConfig {
  const theme: Spec.Theme = { ...defaultTheme, ...config.theme };
  const properties = Object.fromEntries(
    Object.entries(theme).flatMap(([key, value]: [string, Spec.ThemeValue | undefined]) =>
      value === undefined ? [] : [[propertyOf(key), valueOf(value)]]
    ),
  );

  // React types no custom properties: they are plain entries of the style object.
  return { i18n: config.i18n, themeStyle: properties as CSSProperties };
}
