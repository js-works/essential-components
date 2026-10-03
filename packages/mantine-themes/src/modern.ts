import { Badge, Button } from '@mantine/core';
import type { CSSVariablesResolver, MantineThemeOverride } from '@mantine/core';

export { modernOverride, modernVariables };

// The `modern` variant (the part of it that does not depend on the colors), also for an app that has its own theme and
// merges this into it (`modernTheme` in `index.ts`):
// - smaller corners: `0 1 2 3 4px` instead of Mantine's `2 4 8 16 32px` (the default radius `sm`: 1px instead of 4px);
// - the system's UI font for text and headings (a font is not shipped), headings 600, buttons 500, badges not uppercase;
// - a bit more contrast (`modernVariables`): the borders of the inputs and the lines, the secondary text and the
//   placeholders, each one step stronger than Mantine's own.

// The text of the `modern` variant: the system's UI font (Shoelace's `modern` was Open Sans).
const MODERN_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const modernOverride: MantineThemeOverride = {
  radius: { xs: '0', sm: '1px', md: '2px', lg: '3px', xl: '4px' },
  defaultRadius: 'sm',
  fontFamily: MODERN_FONT,
  headings: { fontFamily: MODERN_FONT, fontWeight: '600' },
  components: {
    Badge: Badge.extend({ defaultProps: { tt: 'none' } }),
    Button: Button.extend({ defaultProps: { fw: 500 } }),
  },
};

const modernVariables: ReturnType<CSSVariablesResolver> = {
  variables: {},
  light: {
    '--mantine-color-default-border': 'var(--mantine-color-gray-5)',
    '--mantine-color-dimmed': 'var(--mantine-color-gray-7)',
    '--mantine-color-placeholder': 'var(--mantine-color-gray-6)',
  },
  dark: {
    '--mantine-color-default-border': 'var(--mantine-color-dark-3)',
    '--mantine-color-dimmed': 'var(--mantine-color-dark-1)',
    '--mantine-color-placeholder': 'var(--mantine-color-dark-2)',
  },
};
