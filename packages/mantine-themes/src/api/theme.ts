import type { CSSVariablesResolver, MantineThemeOverride } from '@mantine/core';
import type { colorSetups } from '../color-setups.js';

export type { ColorName, ColorSetup, Options, Size, ThemeBundle, Variant };

// A color as a hex string (`#0ea5e9`, or `#09f`).
type ColorSetup = {
  primary?: string;
  success?: string;
  warning?: string;
  danger?: string;
};

type ColorName = keyof typeof colorSetups;

type Size = 'default' | 'compact';

type Variant = 'default' | 'modern';

type Options = {
  colors?: ColorName | ColorSetup;
  size?: Size;
  variant?: Variant;
  accentProperty?: string;
};

type ThemeBundle = {
  theme: MantineThemeOverride;
  cssVariablesResolver: CSSVariablesResolver;
};
