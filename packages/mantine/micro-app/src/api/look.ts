import type { CSSVariablesResolver, MantineColorsTuple, MantineThemeOverride } from '@mantine/core';
import type { ComponentType, ReactNode } from 'react';

import type { OverlaysConfig } from '@local/overlays/react';

export type { MicroAppLook, MicroAppLookOptions, MicroAppLookTokens };

type MicroAppLookTokens = {
  accent?: string;
  fontSize?: string;
  fontFamily?: string;
  scale?: string;
};

type MicroAppLookOptions = {
  accent?: MantineColorsTuple;
  danger?: MantineColorsTuple;
  success?: MantineColorsTuple;
  warning?: MantineColorsTuple;
  tokens?: MicroAppLookTokens;
  Scope: ComponentType<{ children: ReactNode }>;
};

type MicroAppLook = {
  theme: MantineThemeOverride;
  cssVariablesResolver: CSSVariablesResolver;
  overlaysConfig: OverlaysConfig;
};
