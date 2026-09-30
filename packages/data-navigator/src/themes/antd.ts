import type { DataNavigator } from '../api';

export { antdTheme };

// The Ant Design theme: maps the design values onto the CSS variables of antd 6.
// antd does not set its variables on :root, but on a class of its own (`css-var-root` by default), which only its own
// components carry. So the table must sit inside an element with that class, or the variables are not there.
const antdTheme: Required<DataNavigator.Theme> = {
  colorText: 'var(--ant-color-text)',
  colorTextDimmed: 'var(--ant-color-text-secondary)',
  colorSurface: 'var(--ant-color-bg-container)',
  colorSurfaceStrong: 'var(--ant-color-fill)',
  colorBorder: 'var(--ant-color-border)',
  colorHeader: 'var(--ant-color-fill-alter)',
  colorHeaderHover: 'var(--ant-color-fill-secondary)',
  colorHover: 'var(--ant-color-fill-alter)',
  colorHoverBorder: 'var(--ant-color-split)',
  colorHoverAccent: 'var(--ant-color-primary-bg-hover)',
  colorStripe: 'var(--ant-color-fill-quaternary)',
  colorStripeHover: 'var(--ant-color-fill-tertiary)',
  colorSelected: 'var(--ant-control-item-bg-active)',
  colorSelectedBorder: 'var(--ant-control-item-bg-active-hover)',
  colorSelectedNeutral: 'var(--ant-color-fill-secondary)',
  colorPrimary: 'var(--ant-color-primary)',
  colorPrimaryHover: 'var(--ant-color-primary-hover)',
  colorOnPrimary: 'var(--ant-color-text-light-solid)',
  colorDanger: 'var(--ant-color-error)',
  colorFocus: 'var(--ant-color-primary)',
  radius: 'var(--ant-border-radius)',
  buttonRadius: 'var(--ant-border-radius)',
  shadow: 'var(--ant-box-shadow-secondary)',
  fontFamily: 'var(--ant-font-family)',
  fontSize: 'var(--ant-font-size)',
  fontSizeSm: 'var(--ant-font-size-sm)',
  fontWeightBold: 'var(--ant-font-weight-strong)',
  spacingXs: 'var(--ant-padding-xs)',
  spacingSm: 'var(--ant-padding-sm)',
  spacingMd: 'var(--ant-padding)',
  controlHeight: 'var(--ant-control-height)',
};
