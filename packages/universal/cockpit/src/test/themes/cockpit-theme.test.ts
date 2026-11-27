import { describe, expect, it } from 'vitest';

import { appHeaderStyles } from '../../main/element/app-header-styles.js';
import { styles } from '../../main/element/styles.js';
import { createCockpitTheme, createMantineCockpitTheme } from '../../main/index.js';
import { loginStyles } from '../../main/login/login-styles.js';
import { navTreeStyles } from '../../main/nav-tree/nav-tree-styles.js';

// One theme for every element: each reads its keys; the header's accent keys follow the accent when not set.
describe('the cockpit theme', () => {
  it('the app header follows the accent', () => {
    const css = appHeaderStyles({ accentColor: 'teal' });

    expect(css).toContain('color-mix(in srgb, light-dark(teal, color-mix(in oklab, teal 60%, white)) 11%');
    expect(css).not.toContain('#0a5cc2');
  });

  it('a header key wins over the accent', () => {
    const css = appHeaderStyles({ accentColor: 'teal', headerFocusRingColor: 'orange' });

    expect(css).toContain('orange');
  });

  it('the Mantine theme: the header\'s keys, the accent of the other elements', () => {
    expect(appHeaderStyles(createMantineCockpitTheme())).toContain('var(--mantine-primary-color-light-color)');
    expect(navTreeStyles(createMantineCockpitTheme())).toContain('var(--mantine-primary-color-filled)');
  });

  it('the nav tree\'s icons: the accent, or navTreeIconColor', () => {
    expect(navTreeStyles({ accentColor: 'teal' })).toMatch(/\.tile \{[^}]*color: light-dark\(teal/);
    expect(navTreeStyles({ accentColor: 'teal', navTreeIconColor: 'white' })).toMatch(/\.tile \{[^}]*color: white/);
  });

  it('buttonActiveTransform: none by default, the Mantine theme\'s press in every element', () => {
    const press = 'transform: translateY(calc(0.0625rem * var(--mantine-scale)))';

    expect(loginStyles({})).toContain('transform: none');
    expect(loginStyles(createMantineCockpitTheme())).toContain(press);
    expect(appHeaderStyles(createMantineCockpitTheme())).toContain(press);
    expect(styles(createMantineCockpitTheme())).toContain(press);
  });

  it('buttonBorderRadius: 5px by default, Mantine\'s radius in the Mantine theme', () => {
    expect(loginStyles({})).toMatch(/\.primary \{[^}]*border-radius: 5px/);
    expect(loginStyles(createMantineCockpitTheme())).toMatch(
      /\.primary \{[^}]*border-radius: var\(--mantine-radius-default\)/,
    );
    expect(styles(createMantineCockpitTheme())).toMatch(
      /\.retry-button \{[^}]*border-radius: var\(--mantine-radius-default\)/,
    );
  });

  it('the ready themes: a new object each call, the given keys on top, an undefined one hides nothing', () => {
    const theme = createCockpitTheme({ accentColor: 'teal', sidebarWidth: undefined });

    expect(theme).toMatchObject({ accentColor: 'teal', sidebarWidth: '256px', buttonBorderRadius: '5px' });
    expect(theme.fontFamily).toBeUndefined();
    expect(createCockpitTheme()).not.toBe(createCockpitTheme());
    expect(createMantineCockpitTheme({ buttonActiveTransform: 'scale(0.96)' })).toMatchObject({
      accentColor: 'var(--mantine-primary-color-filled)',
      buttonActiveTransform: 'scale(0.96)',
      sidebarWidth: '256px',
    });
  });

  it('the default accent given explicitly is not mixed again', () => {
    expect(appHeaderStyles(createCockpitTheme())).not.toContain('light-dark(light-dark');
  });
});
