import type { DataTable } from '../api';

export { mantineTheme };

// The Mantine theme: maps the design values onto Mantine's CSS variables. Mantine's variables adapt to its color
// scheme, so dark mode follows Mantine.
const mantineTheme: Required<DataTable.Theme> = {
  colorText: 'var(--mantine-color-text)',
  colorTextDimmed: 'var(--mantine-color-dimmed)',
  colorSurface: 'var(--mantine-color-body)',
  colorSurfaceStrong: { light: 'var(--mantine-color-gray-1)', dark: 'var(--mantine-color-dark-5)' },
  colorBorder: 'var(--mantine-color-default-border)',
  // The lines between the rows: lighter than the border (which a theme may make stronger, e.g. `modernTheme`).
  colorDivider: { light: 'var(--mantine-color-gray-3)', dark: 'var(--mantine-color-dark-4)' },
  colorHover: 'var(--mantine-color-default-hover)',
  // The next lighter value than `light-hover` (2026-10-04, the user's wish): the one of the selected rows.
  colorHoverAccent: 'var(--mantine-primary-color-light)',
  // Light mode: the next lighter value than `light` (shade 0, 2026-10-04, the user's wish), so the row hover (shade 1) stays
  // a step stronger than the selection; dark mode as before.
  colorSelected: { light: 'var(--mantine-primary-color-0)', dark: 'var(--mantine-primary-color-light)' },
  colorSelectedBorder: 'var(--mantine-primary-color-light-hover)',
  colorPrimary: 'var(--mantine-primary-color-filled)',
  colorPrimaryHover: 'var(--mantine-primary-color-filled-hover)',
  colorOnPrimary: 'var(--mantine-primary-color-contrast)',
  colorDanger: 'var(--mantine-color-error)',
  colorFocus: 'var(--mantine-primary-color-filled)',
  // Like Mantine's own ring: 2px, 2px away.
  focusRingWidth: '2px',
  focusRingOffset: '2px',
  radius: 'var(--mantine-radius-default)',
  buttonRadius: 'var(--mantine-radius-default)',
  shadow: 'var(--mantine-shadow-md)',
  shadowSm: 'var(--mantine-shadow-sm)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
  fontSizeSm: 'var(--mantine-font-size-xs)',
  fontWeightBold: '600',
  spacingXs: 'var(--mantine-spacing-xs)',
  spacingSm: 'var(--mantine-spacing-sm)',
  spacingMd: 'var(--mantine-spacing-md)',
  controlHeight: 'calc(2.25rem * var(--mantine-scale))',
  // A normal Mantine button (its default size `sm`, which the modern theme keeps; 2026-10-09, the user's wish): as tall
  // as the inputs. It was Mantine's `md`, 2.5rem, 4px taller like the default theme's.
  buttonHeight: 'calc(2.25rem * var(--mantine-scale))',
};
