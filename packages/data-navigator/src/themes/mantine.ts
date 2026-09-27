import type { DataNavigator } from '../api';

export { mantineTheme };

// The Mantine theme: maps the design values onto Mantine's CSS variables. Mantine's variables adapt to its color
// scheme, so dark mode follows Mantine.
const mantineTheme: Required<DataNavigator.Theme> = {
  colorText: 'var(--mantine-color-text)',
  colorTextDimmed: 'var(--mantine-color-dimmed)',
  colorSurface: 'var(--mantine-color-body)',
  colorBorder: 'var(--mantine-color-default-border)',
  colorHeader: 'var(--mantine-color-default-hover)',
  colorHeaderHover: 'var(--mantine-color-gray-light-hover)',
  colorHover: 'var(--mantine-color-default-hover)',
  colorHoverBorder: 'var(--mantine-color-default-border)',
  colorHoverAccent: 'var(--mantine-primary-color-light-hover)',
  colorStripe: 'var(--mantine-color-default-hover)',
  colorStripeHover: 'var(--mantine-color-gray-light)',
  colorSelected: 'var(--mantine-primary-color-light)',
  colorSelectedBorder: 'var(--mantine-primary-color-light-hover)',
  colorSelectedNeutral: 'var(--mantine-color-gray-light)',
  colorPrimary: 'var(--mantine-primary-color-filled)',
  colorPrimaryHover: 'var(--mantine-primary-color-filled-hover)',
  colorOnPrimary: 'var(--mantine-primary-color-contrast)',
  colorDanger: 'var(--mantine-color-error)',
  colorFocus: 'var(--mantine-primary-color-filled)',
  radius: 'var(--mantine-radius-default)',
  buttonRadius: 'var(--mantine-radius-default)',
  shadow: 'var(--mantine-shadow-md)',
  fontFamily: 'var(--mantine-font-family)',
  fontSize: 'var(--mantine-font-size-sm)',
  fontSizeSm: 'var(--mantine-font-size-xs)',
  fontWeightBold: '600',
  spacingXs: 'var(--mantine-spacing-xs)',
  spacingSm: 'var(--mantine-spacing-sm)',
  spacingMd: 'var(--mantine-spacing-md)',
  controlHeight: 'calc(2.25rem * var(--mantine-scale))',
};
