import type { CSSVariablesResolver, MantineThemeOverride } from '@mantine/core';
import type { colorSetups } from '../color-setups.js';

export type { ColorSetup, ColorSetupName, ThemeBundle, ThemeOptions, ThemeSize, ThemeVariant };

// A color as a hex string (`#0ea5e9`, or `#09f`).
type ColorSetup = {
  primary?: string;
  success?: string;
  warning?: string;
  danger?: string;
};

type ColorSetupName = keyof typeof colorSetups;

type ThemeSize = 'default' | 'compact';

type ThemeVariant = 'default' | 'modern';

type ThemeOptions = {
  colors?: ColorSetupName | ColorSetup;
  size?: ThemeSize;
  variant?: ThemeVariant;
  accentProperty?: string;
};

type ThemeBundle = {
  theme: MantineThemeOverride;
  cssVariablesResolver: CSSVariablesResolver;
};
