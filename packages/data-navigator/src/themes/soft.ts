import type { DataNavigator } from '../api';

export { softTheme };

// The soft theme: the look of the design spec of the filter popup and the selection bar (2026-09-28). Lighter lines,
// rounder corners, a brighter blue as the one accent, a smaller font and a medium instead of a bold weight. Like the
// default theme, it has hard-coded values, with a light and a dark value for every color (`light-dark()`).
const softTheme: Required<DataNavigator.Theme> = {
  colorText: { light: '#1f1f1f', dark: '#ececec' },
  colorTextDimmed: { light: '#666', dark: '#a6a6a6' },
  colorSurface: { light: '#fff', dark: '#161616' },
  colorSurfaceStrong: { light: '#e6e6e6', dark: '#2e2e2e' },
  colorBorder: { light: '#dcdcdc', dark: '#383838' },
  colorHeader: { light: '#f0f0f0', dark: '#262626' },
  colorHeaderHover: { light: '#f2f2f2', dark: '#242424' },
  colorHover: { light: '#f7f7f7', dark: '#1d1d1d' },
  colorHoverBorder: { light: '#ebebeb', dark: '#2c2c2c' },
  colorHoverAccent: { light: '#dcebfd', dark: '#1d3a61' },
  colorStripe: { light: '#fafafa', dark: '#1a1a1a' },
  colorStripeHover: { light: '#f3f3f3', dark: '#222' },
  colorSelected: { light: '#eaf2fd', dark: '#14294a' },
  colorSelectedBorder: { light: '#c7dcf6', dark: '#2a4f85' },
  colorSelectedNeutral: { light: '#f2f2f2', dark: '#222' },
  colorPrimary: { light: '#2b72d6', dark: '#6ea2ff' },
  colorPrimaryHover: { light: '#1f5fb8', dark: '#8bb5ff' },
  colorOnPrimary: { light: '#fff', dark: '#111' },
  colorDanger: { light: '#c62828', dark: '#ff6b63' },
  colorFocus: { light: '#2b72d6', dark: '#8bb5ff' },
  radius: '6px',
  buttonRadius: '6px',
  // light-dark() works only for colors, so it sits in the color of the shadow.
  shadow: '0 6px 20px light-dark(rgb(0 0 0 / 10%), rgb(0 0 0 / 55%))',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '13px',
  fontSizeSm: '12px',
  fontWeightBold: '500',
  spacingXs: '8px',
  spacingSm: '12px',
  spacingMd: '16px',
  controlHeight: '32px',
};
