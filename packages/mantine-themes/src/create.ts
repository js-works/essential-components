import { createTheme, DEFAULT_THEME } from '@mantine/core';
import type { CSSVariablesResolver, MantineColorsTuple } from '@mantine/core';
import type * as Spec from './api';
import { colorSetups } from './color-setups';
import { parseHex, shades } from './colors';
import { MODERN_DANGER, modernOverride, modernVariables } from './modern';

export { combineCssVariables, createMantineTheme, modernTheme };

// How much of the accent each shade has in a mix with white (0 to 5) or black (7 to 9), for the live accent.
const ACCENT_MIX = [10, 22, 40, 58, 75, 88, 100, 88, 76, 62] as const;

// The theme for a `MantineProvider`, and the CSS variables resolver that goes with it:
//
//   const { theme, cssVariablesResolver } = createMantineTheme({ colors: 'skyBlue', size: 'compact', variant: 'modern' });
//   <MantineProvider theme={theme} cssVariablesResolver={cssVariablesResolver}>
//
// - `colors`: a name of `colorSetups`, or `{ primary?, success?, warning?, danger? }` (hex colors). Each is made into
//   ten shades of Mantine: the theme's colors `accent` (the primary color), `success`, `warning` and `danger`. Not given:
//   Mantine's indigo, green, orange and red. An unknown name or an invalid color throws.
// - `size`: `compact` is Mantine's scale 0.9 (all its sizes, also the text).
// - `variant`: `modern` has smaller corners, the system's UI font and a bit more contrast (see `modern.ts`).
// - `accentProperty` (e.g. `--app-accent-color`): the accent live from this custom property (any CSS color, set by the
//   page's CSS, e.g. a menu): its ten shades as `color-mix()` of it with white and black; the shades of `colors` count
//   where it is not set.
function createMantineTheme(options: Spec.Options = {}): Spec.ThemeBundle {
  const { size = 'default', variant = 'default', accentProperty } = options;
  const setup = typeof options.colors === 'string' ? setupOf(options.colors) : options.colors ?? {};
  const modern = variant === 'modern';
  const palette = {
    accent: colorOf('primary', setup.primary, DEFAULT_THEME.colors.indigo),
    danger: colorOf('danger', setup.danger ?? (modern ? MODERN_DANGER : undefined), DEFAULT_THEME.colors.red),
    success: colorOf('success', setup.success, DEFAULT_THEME.colors.green),
    warning: colorOf('warning', setup.warning, DEFAULT_THEME.colors.orange),
  };

  const theme = createTheme({
    colors: palette,
    primaryColor: 'accent',
    autoContrast: true,
    scale: size === 'compact' ? 0.9 : 1,
    defaultRadius: 'sm',
    ...(modern ? modernOverride : {}),
  });
  const live = accentProperty === undefined ? undefined : liveAccent(accentProperty, palette.accent);

  const cssVariablesResolver: CSSVariablesResolver = () => ({
    variables: { ...(modern ? modernVariables.variables : {}), ...live?.variables },
    light: { ...(modern ? modernVariables.light : {}), ...live?.light },
    dark: { ...(modern ? modernVariables.dark : {}), ...live?.dark },
  });

  return { theme, cssVariablesResolver };
}

// The ready-made modern theme: `createMantineTheme({ variant: 'modern' })`, Mantine's own colors. To use with colors of
// your own, or merged into a theme of your own (`mergeThemeOverrides(modernTheme.theme, ownTheme)` and
// `combineCssVariables(modernTheme.cssVariablesResolver, ownResolver)`; the later one wins).
const modernTheme: Spec.ThemeBundle = createMantineTheme({ variant: 'modern' });

// Several CSS variables resolvers as one: the variables of each, the later ones win over the earlier ones.
function combineCssVariables(...resolvers: CSSVariablesResolver[]): CSSVariablesResolver {
  return (theme) => {
    const combined: ReturnType<CSSVariablesResolver> = { variables: {}, light: {}, dark: {} };

    for (const resolver of resolvers) {
      const { variables, light, dark } = resolver(theme);

      Object.assign(combined.variables, variables);
      Object.assign(combined.light, light);
      Object.assign(combined.dark, dark);
    }

    return combined;
  };
}

function setupOf(name: string): Spec.ColorSetup {
  const setup = (colorSetups as Record<string, Spec.ColorSetup>)[name];

  if (setup === undefined) {
    throw new Error(`mantine-themes: no color setup "${name}" (${Object.keys(colorSetups).join(', ')})`);
  }

  return setup;
}

function colorOf(role: string, value: string | undefined, fallback: MantineColorsTuple): MantineColorsTuple {
  if (value === undefined) {
    return fallback;
  }

  const color = parseHex(value);

  if (color === undefined) {
    throw new Error(`mantine-themes: the ${role} color "${value}" is not a hex color (#rrggbb)`);
  }

  return shades(color);
}

// The accent's shades live from a custom property (the mixes with white and black, in CSS), each with the theme's own
// shade as the fallback, and the variables Mantine computes from the shades in JS (its `darken()` and `alpha()`)
// follow them as `color-mix()`.
function liveAccent(property: string, accent: MantineColorsTuple): ReturnType<CSSVariablesResolver> {
  const step = (index: number) => `${property}-${index}`;

  return {
    variables: Object.fromEntries(
      ACCENT_MIX.flatMap((percent, index) => [
        [
          step(index),
          index === 6
            ? `var(${property})`
            : `color-mix(in oklab, var(${property}) ${percent}%, ${index < 6 ? 'white' : 'black'})`,
        ],
        [`--mantine-color-accent-${index}`, `var(${step(index)}, ${accent[index]})`],
      ]),
    ),
    light: {
      '--mantine-color-accent-outline-hover': 'color-mix(in srgb, var(--mantine-color-accent-6) 5%, transparent)',
    },
    dark: {
      '--mantine-color-accent-light': 'color-mix(in srgb, var(--mantine-color-accent-9) 50%, black)',
      '--mantine-color-accent-light-hover': 'color-mix(in srgb, var(--mantine-color-accent-9) 70%, black)',
      '--mantine-color-accent-outline-hover': 'color-mix(in srgb, var(--mantine-color-accent-4) 5%, transparent)',
    },
  };
}
