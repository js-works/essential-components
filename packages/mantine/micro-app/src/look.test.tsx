import { DEFAULT_THEME, mergeMantineTheme } from '@mantine/core';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import { createLook } from './look.js';

const Scope = ({ children }: { children: ReactNode }) => <div className="app-scope">{children}</div>;

describe('createLook', () => {
  it('makes the accent the primary color, and the dialogs\' content a scope of the app', () => {
    const look = createLook({ Scope });

    expect(look.theme.primaryColor).toBe('accent');
    expect(look.overlaysConfig.dialogs?.wrapContent).toBeTypeOf('function');
    expect(look.overlaysConfig.toasts?.placement).toBe('bottom-end');
  });

  it('reads the app\'s custom properties by the names it gives, and none without them', () => {
    const theme = mergeMantineTheme(DEFAULT_THEME, createLook({ Scope }).theme);
    const withTokens = createLook({
      Scope,
      tokens: { accent: '--my-app-accent', fontSize: '--my-app-font-size' },
    });
    const without = createLook({ Scope });
    const variables = withTokens.cssVariablesResolver(theme).variables;

    expect(variables['--mantine-color-accent-6']).toContain('--my-app-accent');
    expect(variables['--mantine-font-size-sm']).toBe('var(--my-app-font-size, 0.875rem)');
    expect(JSON.stringify(without.cssVariablesResolver(theme))).not.toContain('--my-app');
  });
});
