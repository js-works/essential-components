import { createContext } from 'react';
import type { CSSProperties } from 'react';
import type { DataNavigatorComponent as Spec } from '../react/api';
import { defaultTheme } from '../themes/default';

export { checkI18nType, ConfigContext, resolveConfig };
export type { ResolvedConfig };

// The configuration of one data navigator, ready to use: its i18n adapter, the theme as the inline custom properties of
// the root, and (React with an i18n factory) the callback that gets the root element, to ask the factory with it.
type ResolvedConfig = {
  i18n: Spec.I18nAdapter | undefined;
  themeStyle: CSSProperties;
  onRoot?: ((root: HTMLElement) => void) | undefined;
};

// Passed down privately by the created component, e.g. to the built-in filters (which render their own texts).
const ConfigContext = createContext<ResolvedConfig>(resolveConfig(undefined));

// The union type prevents any other `type`, but not in plain JavaScript or with a cast config (e.g. an adapter given
// directly, as before the factory and the hook).
function checkI18nType(i18n: { type: unknown } | undefined, expected: readonly string[]): void {
  if (i18n !== undefined && !expected.includes(i18n.type as string)) {
    throw new TypeError(
      `Unknown i18n type: ${String(i18n.type)} (expected ${expected.map((type) => `'${type}'`).join(' or ')}).`,
    );
  }
}

// `colorTextDimmed` → `--datnav-color-text-dimmed`. The custom properties are internal: apps configure the theme only.
function propertyOf(key: string): string {
  return `--datnav-${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

// A value with a light and a dark variant follows the color scheme of the page.
function valueOf(value: Spec.ThemeValue): string {
  return typeof value === 'string' ? value : `light-dark(${value.light}, ${value.dark})`;
}

// Missing theme values come from the default theme, so the table always has its look. The i18n adapter is added per
// data navigator (it may come from a factory or a hook).
function resolveConfig(configTheme: Spec.Theme | undefined): ResolvedConfig {
  const theme: Spec.Theme = { ...defaultTheme, ...configTheme };
  const properties = Object.fromEntries(
    Object.entries(theme).flatMap(([key, value]: [string, Spec.ThemeValue | undefined]) =>
      value === undefined ? [] : [[propertyOf(key), valueOf(value)]]
    ),
  );

  // React types no custom properties: they are plain entries of the style object.
  return { i18n: undefined, themeStyle: properties as CSSProperties };
}
