export type { FileUploadTheme, ThemeColor };

type ThemeColor = string | { light: string; dark: string };

type FileUploadTheme = {
  accentColor?: ThemeColor;
  accentTextColor?: ThemeColor;
  textColor?: ThemeColor;
  mutedColor?: ThemeColor;
  borderColor?: ThemeColor;
  surfaceColor?: ThemeColor;
  successColor?: ThemeColor;
  dangerColor?: ThemeColor;
  borderRadius?: string;
  buttonBorderRadius?: string;
  fontFamily?: string;
  fontSize?: string;
};
