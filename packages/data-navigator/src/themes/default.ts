import type { DataNavigator } from '../api';

export { defaultTheme };

// The default theme: the neutral look, for apps without a UI library that has a theme here. Pure grays with a high
// contrast. Colors have a light and a dark value, which follow the color scheme of the page (`light-dark()`).
const defaultTheme: Required<DataNavigator.Theme> = {
  colorText: { light: '#111', dark: '#f5f5f5' },
  colorTextDimmed: { light: '#555', dark: '#bbb' },
  colorSurface: { light: '#fff', dark: '#111' },
  colorSurfaceStrong: { light: '#ededed', dark: '#3a3a3a' },
  colorBorder: { light: '#c6c6c6', dark: '#474747' },
  colorHeader: { light: '#eee', dark: '#262626' },
  colorHeaderHover: { light: '#efefef', dark: '#262626' },
  colorHover: { light: '#f9f9f9', dark: '#1a1a1a' },
  colorHoverBorder: { light: '#cfcfcf', dark: '#3c3c3c' },
  colorHoverAccent: { light: '#cfe6fc', dark: '#173d6b' },
  colorStripe: { light: '#f8f8f8', dark: '#181818' },
  colorStripeHover: { light: '#e4e4e4', dark: '#303030' },
  colorSelected: { light: '#e2f1ff', dark: '#0f2b4d' },
  colorSelectedBorder: { light: '#9fcdf5', dark: '#2f6cb8' },
  colorSelectedNeutral: { light: '#eee', dark: '#242424' },
  colorPrimary: { light: '#0a5cc2', dark: '#5aa0ff' },
  colorPrimaryHover: { light: '#084a9e', dark: '#78b0ff' },
  colorOnPrimary: { light: '#fff', dark: '#111' },
  colorDanger: { light: '#b3141f', dark: '#ff6b63' },
  colorFocus: { light: '#0a5cc2', dark: '#78b0ff' },
  radius: '2px',
  buttonRadius: '5px',
  // light-dark() works only for colors, so it sits in the color of the shadow.
  shadow: '0 4px 12px light-dark(rgb(0 0 0 / 15%), rgb(0 0 0 / 60%))',
  fontFamily: 'system-ui, sans-serif',
  fontSize: '14px',
  fontSizeSm: '12px',
  fontWeightBold: '600',
  spacingXs: '8px',
  spacingSm: '12px',
  spacingMd: '16px',
  controlHeight: '32px',
};
