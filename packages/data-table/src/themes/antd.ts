import type { DataTable } from '../api';

export { antdTheme };

// The Ant Design theme: maps the design values onto the CSS variables of antd 6.
// antd does not set its variables on :root, but on a class of its own (`css-var-root` by default), which only its own
// components carry. So the table must sit inside an element with that class, or the variables are not there.
const antdTheme: Required<DataTable.Theme> = {
  colorText: 'var(--ant-color-text)',
  colorTextDimmed: 'var(--ant-color-text-secondary)',
  colorSurface: 'var(--ant-color-bg-container)',
  colorSurfaceStrong: 'var(--ant-color-fill-secondary)',
  colorBorder: 'var(--ant-color-border)',
  // The lines between the rows: antd's own table lines.
  colorDivider: 'var(--ant-color-border-secondary)',
  colorHover: 'var(--ant-color-fill-alter)',
  colorHoverAccent: 'var(--ant-color-primary-bg-hover)',
  colorSelected: 'var(--ant-control-item-bg-active)',
  colorSelectedBorder: 'var(--ant-control-item-bg-active-hover)',
  colorPrimary: 'var(--ant-color-primary)',
  colorPrimaryHover: 'var(--ant-color-primary-hover)',
  colorOnPrimary: 'var(--ant-color-text-light-solid)',
  colorDanger: 'var(--ant-color-error)',
  colorFocus: 'var(--ant-color-primary)',
  // 2px, 2px away, like the other themes.
  focusRingWidth: '2px',
  focusRingOffset: '2px',
  radius: 'var(--ant-border-radius)',
  buttonRadius: 'var(--ant-border-radius)',
  shadow: 'var(--ant-box-shadow-secondary)',
  shadowSm: 'var(--ant-box-shadow-tertiary)',
  fontFamily: 'var(--ant-font-family)',
  fontSize: 'var(--ant-font-size)',
  fontSizeSm: 'var(--ant-font-size-sm)',
  fontWeightBold: 'var(--ant-font-weight-strong)',
  spacingXs: 'var(--ant-padding-xs)',
  spacingSm: 'var(--ant-padding-sm)',
  spacingMd: 'var(--ant-padding)',
  controlHeight: 'var(--ant-control-height)',
  buttonHeight: 'calc(var(--ant-control-height) + 4px)',
};
