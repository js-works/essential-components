import { Badge, Button, Input, InputWrapper } from '@mantine/core';
import type { CSSVariablesResolver, MantineThemeOverride } from '@mantine/core';

export { MODERN_DANGER, modernOverride, modernVariables };

// The `modern` variant (the part of it that does not depend on the colors), also for an app that has its own theme and
// merges this into it (`modernTheme` in `index.ts`):
// - smaller corners: `2 3 6 8 10px` instead of Mantine's `2 4 8 16 32px` (the default radius `sm`: 3px instead of 4px);
// - the system's UI font for text and headings (a font is not shipped), headings 600, buttons 500, badges not uppercase;
// - the labels of the inputs a bit smaller: 13px (of the base text size), weight 600 as in Mantine;
// - a bit more contrast (`modernVariables`): the borders of the inputs and the lines, the secondary text and the
//   placeholders, each one step stronger than Mantine's own.

// The danger color of the `modern` variant where the color setup gives none: Mantine's `red.9` as the main color (shade 6),
// a deeper red than Mantine's own default `red.6` (`#fa5252`, a bright coral).
const MODERN_DANGER = '#c92a2a';

// The text of the `modern` variant: the system's UI font (Shoelace's `modern` was Open Sans).
const MODERN_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const modernOverride: MantineThemeOverride = {
  radius: { xs: '2px', sm: '3px', md: '6px', lg: '8px', xl: '10px' },
  defaultRadius: 'sm',
  fontFamily: MODERN_FONT,
  headings: { fontFamily: MODERN_FONT, fontWeight: '600' },
  components: {
    Badge: Badge.extend({ defaultProps: { tt: 'none' } }),
    Button: Button.extend({ defaultProps: { fw: 500 } }),
    // The border of the inputs: Mantine hard-codes `gray-4` / `dark-4` per variant and ignores `default-border`, so the
    // default variant gets the stronger border of `modernVariables` (the filled and unstyled ones keep their transparent one).
    Input: Input.extend({
      styles: (_theme, props) =>
        props.variant === undefined || props.variant === 'default'
          ? { input: { '--input-bd': 'var(--mantine-color-default-border)' } }
          : {},
    }),
    // The labels of the inputs: a bit smaller (13px at the base text size of 14px, proportional to it: it follows the
    // apps' text size and the scale), the weight stays Mantine's own, 600 (500 was tried, the user wanted 600 again).
    InputWrapper: InputWrapper.extend({
      styles: { label: { fontSize: 'calc(var(--mantine-font-size-sm) * 13 / 14)', fontWeight: 600 } },
    }),
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
