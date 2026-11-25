import { createContext, useContext } from 'react';

import type * as Spec from '../api/react/index.js';
import { defaultTheme } from '../themes/default.js';
import type { ThemeStylesheet } from './stylesheet.js';
import { resolveTheme, themeStylesheet } from './stylesheet.js';

export type { ResolvedConfig };
export { ConfigContext, resolveConfig, useThemed };

// The configuration of one data table, ready to use: its i18n adapter and the stylesheet of its theme (see
// stylesheet.ts).
type ResolvedConfig = {
  i18n: Spec.I18nAdapter | undefined;
  stylesheet: ThemeStylesheet;
};

// Passed down privately by the created component, e.g. to the built-in filters (which render their own texts).
const ConfigContext = createContext<ResolvedConfig>(resolveConfig(undefined));

// A value with a light and a dark variant follows the color scheme of the page.
function valueOf(value: Spec.ThemeValue): string {
  return typeof value === 'string' ? value : `light-dark(${value.light}, ${value.dark})`;
}

// Missing theme values come from the default theme, so the table always has its look. The i18n adapter is added by
// the element (its config) or the component (its hook).
function resolveConfig(configTheme: Spec.DataTableTheme | undefined): ResolvedConfig {
  const theme: Spec.DataTableTheme = { ...defaultTheme, ...configTheme };
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
