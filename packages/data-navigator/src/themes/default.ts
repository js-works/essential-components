import type { DataNavigator } from '../api';

export { defaultTheme };

// The default theme: the neutral look, for apps without a UI library that has a theme here. Pure grays with a high
// contrast. Colors have a light and a dark value, which follow the color scheme of the page (`light-dark()`).
const defaultTheme: Required<DataNavigator.Theme> = {
  colorText: { light: '#111', dark: '#f5f5f5' },
  colorTextDimmed: { light: '#555', dark: '#bbb' },
  colorSurface: { light: '#fff', dark: '#111' },
  colorSurfaceStrong: { light: '#eee', dark: '#262626' },
  colorBorder: { light: '#c6c6c6', dark: '#474747' },
  colorDivider: { light: '#e0e0e0', dark: '#363636' },
  colorHover: { light: '#f9f9f9', dark: '#1a1a1a' },
  colorHoverAccent: { light: '#cfe6fc', dark: '#173d6b' },
  colorSelected: { light: '#e2f1ff', dark: '#0f2b4d' },
  colorSelectedBorder: { light: '#9fcdf5', dark: '#2f6cb8' },
  colorPrimary: { light: '#0a5cc2', dark: '#5aa0ff' },
  colorPrimaryHover: { light: '#084a9e', dark: '#78b0ff' },
  colorOnPrimary: { light: '#fff', dark: '#111' },
  colorDanger: { light: '#b3141f', dark: '#ff6b63' },
  colorFocus: { light: '#0a5cc2', dark: '#78b0ff' },
  radius: '2px',
  buttonRadius: '5px',
  // light-dark() works only for colors, so it sits in the color of the shadow.
  shadow: '0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%))',
  shadowSm: '0 1px 3px light-dark(rgb(0 0 0 / 10%), rgb(0 0 0 / 45%))',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '14px',
  fontSizeSm: '12px',
  fontWeightBold: '600',
  spacingXs: '8px',
  spacingSm: '12px',
  spacingMd: '16px',
  controlHeight: '32px',
};
