import type { CSSVariablesResolver, MantineThemeOverride } from '@mantine/core';
import type { ColorName, ColorSetup } from './color-setups';

export type { ColorName, ColorSetup };

export type Size = 'default' | 'compact';

export type Variant = 'default' | 'modern';

export type Options = {
  colors?: ColorName | ColorSetup;
  size?: Size;
  variant?: Variant;
  accentProperty?: string;
};

export type ThemeBundle = {
  theme: MantineThemeOverride;
  cssVariablesResolver: CSSVariablesResolver;
};
