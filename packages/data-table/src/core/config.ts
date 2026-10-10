import { createContext, useContext } from 'react';
import type { DataTableComponent as Spec } from '../react/api';
import { defaultTheme } from '../themes/default';
import { resolveTheme, themeStylesheet } from './stylesheet';
import type { ThemeStylesheet } from './stylesheet';

export { checkI18nType, ConfigContext, resolveConfig, useThemed };
export type { ResolvedConfig };

// The configuration of one data table, ready to use: its i18n adapter, the stylesheet of its theme (see
// stylesheet.ts), and (React with an i18n factory) the callback that gets the root element, to ask the factory with it.
type ResolvedConfig = {
  i18n: Spec.I18nAdapter | undefined;
  stylesheet: ThemeStylesheet;
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

// A value with a light and a dark variant follows the color scheme of the page.
function valueOf(value: Spec.ThemeValue): string {
  return typeof value === 'string' ? value : `light-dark(${value.light}, ${value.dark})`;
}

// Missing theme values come from the default theme, so the table always has its look. The i18n adapter is added per
// data table (it may come from a factory or a hook).
function resolveConfig(configTheme: Spec.Theme | undefined): ResolvedConfig {
  const theme: Spec.Theme = { ...defaultTheme, ...configTheme };
  const values = Object.fromEntries(
    Object.entries(theme).flatMap(([key, value]: [string, Spec.ThemeValue | undefined]) =>
      value === undefined ? [] : [[key, valueOf(value)]]
    ),
  );

  return { i18n: undefined, stylesheet: themeStylesheet(values) };
}

// For the few lengths the view computes inline: the text with the theme's values for its `var(--param-…)`, like the
// stylesheet (see stylesheet.ts), e.g. `themed('calc(2 * var(--param-spacing-md))')`.
function useThemed(): (text: string) => string {
  const { stylesheet } = useContext(ConfigContext);

  return (text) => resolveTheme(text, stylesheet.values);
}
