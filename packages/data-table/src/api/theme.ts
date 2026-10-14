export type { DataTableTheme, ThemeValue };

type ThemeValue = string | { light: string; dark: string };

type DataTableTheme = {
  colorText?: ThemeValue;
  colorTextDimmed?: ThemeValue;
  colorSurface?: ThemeValue;
  colorSurfaceStrong?: ThemeValue;
  colorBorder?: ThemeValue;
  colorDivider?: ThemeValue;
  colorHover?: ThemeValue;
  colorHoverAccent?: ThemeValue;
  colorSelected?: ThemeValue;
  colorSelectedBorder?: ThemeValue;
  colorPrimary?: ThemeValue;
  colorPrimaryHover?: ThemeValue;
  colorOnPrimary?: ThemeValue;
  colorDanger?: ThemeValue;
  colorFocus?: ThemeValue;
  // The focus ring of buttons, checkboxes and the like (in `colorFocus`): its width, and its distance from the element.
  focusRingWidth?: string;
  focusRingOffset?: string;
  radius?: string;
  buttonRadius?: string;
  shadow?: string;
  shadowSm?: string;
  fontFamily?: string;
  fontSize?: string;
  fontSizeSm?: string;
  fontWeightBold?: string;
  spacingXs?: string;
  spacingSm?: string;
  spacingMd?: string;
  controlHeight?: string;
  buttonHeight?: string;
};
